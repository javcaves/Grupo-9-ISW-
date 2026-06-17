// turno.service.js: Lógica de negocio para gestión de turnos y asignación de empleados a turnos, con validaciones robustas y manejo de casos especiales como solapamientos, pertenencia a proyectos y restricciones jerárquicas. También incluye helpers privados para cálculos de horarios y validaciones complejas. [cite: 2788, 2808, 1631]
import { AppDataSource } from '../../config/ConfigDB.js';

// ==================== TURNO ====================

// ----- Crear -----
export const crearTurno = async (data) => {
    const turnoRepo = AppDataSource.getRepository("Turno");
    const proyectoRepo = AppDataSource.getRepository("Proyecto");
    const usuarioRepo = AppDataSource.getRepository("Usuario");
    const proyectoUsuarioRepo = AppDataSource.getRepository("ProyectoUsuario");

    // Validar que el proyecto exista
    const proyecto = await proyectoRepo.findOne({ where: { id_proyecto: data.id_proyecto, activo: true } });
    if (!proyecto) return [null, "El proyecto especificado no existe o no se encuentra activo."];

    // Validar unicidad: no puede existir un turno con mismo proyecto, hora_ingreso y hora_salida
    const turnoExistente = await turnoRepo.findOne({
        where: {
            proyecto: { id_proyecto: data.id_proyecto },
            hora_ingreso: data.hora_ingreso,
            hora_salida: data.hora_salida,
            activo: true
        }
    });
    if (turnoExistente) return [null, "Ya existe un turno activo con el mismo proyecto, hora de ingreso y hora de salida."];

    // Validar que se ingrese al menos 1 empleado
    if (!data.empleados || data.empleados.length === 0) {
        return [null, "Se requiere al menos un empleado para crear el turno."];
    }

    // 1. Validar todos los empleados primero
    const turnoEmpleadoRepo = AppDataSource.getRepository("TurnoEmpleado");
    const hoy = new Date().toISOString().split("T")[0];

    for (const emp of data.empleados) {
        const { id_empleado } = emp;

        // 1.1 Verificar pertenencia al proyecto
        const perteneceAlProyecto = await proyectoUsuarioRepo.findOne({
            where: { id_proyecto: data.id_proyecto, id_usuario: id_empleado, activo: true }
        });
        if (!perteneceAlProyecto) return [null, `El empleado con ID ${id_empleado} no pertenece formalmente a este proyecto.`];

        // 1.2 Verificar solapamiento
        const solapado = await _verificarSolapamientoHorario(
            turnoEmpleadoRepo, id_empleado, data.id_proyecto, data.hora_ingreso, data.hora_salida
        );
        if (solapado) return [null, `El empleado ${id_empleado} ya tiene un turno con horario solapado en este proyecto.`];

        // 1.3 Verificar exclusividad de proyecto
        const enOtroProyecto = await _verificarEmpleadoEnOtroProyecto(
            turnoEmpleadoRepo, id_empleado, data.id_proyecto
        );
        if (enOtroProyecto) return [null, `El empleado ${id_empleado} ya está activo en otro proyecto.`];
    }

    // 2. Crear el turno (UNA SOLA VEZ)
    const nuevoTurno = turnoRepo.create({
        proyecto: { id_proyecto: data.id_proyecto },
        nombre: data.nombre,
        hora_ingreso: data.hora_ingreso,
        hora_salida: data.hora_salida,
        descripcion: data.descripcion ?? null,
        activo: true
    });
    const turnoGuardado = await turnoRepo.save(nuevoTurno);

    // 3. Asignar los empleados al turno recién creado
    for (const emp of data.empleados) {
        const { id_empleado, fecha_egreso, trabaja_feriados } = emp;
        const nuevoRegistro = turnoEmpleadoRepo.create({
            id_turno: turnoGuardado.id_turno,
            id_empleado: id_empleado,
            fecha_ingreso: hoy,
            fecha_egreso: fecha_egreso ?? null,
            trabaja_feriados: trabaja_feriados ?? false,
            activo: true
        });
        await turnoEmpleadoRepo.save(nuevoRegistro);
    }

    return [turnoGuardado, null];
};

// ----- Búsqueda -----

export const obtenerTodosActivosPorProyecto = async (id_proyecto) => {
    const turnoRepo = AppDataSource.getRepository("Turno");
    return await turnoRepo.find({
        where: {
            proyecto: { id_proyecto: parseInt(id_proyecto, 10) }
        },
        relations: {
            proyecto: true,
            turnoEmpleados: {
                empleado: true
            }
        }
    });
};

export const obtenerTurnoPorID = async (id) => {
    const turnoRepo = AppDataSource.getRepository("Turno");
    const turno = await turnoRepo.findOne({
        where: { id_turno: parseInt(id, 10) },
        relations: {
            proyecto: true,
            turnoEmpleados: {
                empleado: true
            }
        }
    });

    if (!turno) return [null, "Turno no encontrado."];
    return [turno, null];
};

export const listarTurnos = async () => {
    const turnoRepo = AppDataSource.getRepository("Turno");
    return await turnoRepo.find({
        where: { activo: true },
        relations: {
            proyecto: true,
            turnoEmpleados: {
                empleado: true
            }
        },
        order: { id_turno: 'ASC' }
    });
}
// ----- Actualizar -----

export const actualizarTurno = async (id, data) => {
    const turnoRepo = AppDataSource.getRepository("Turno");

    const turno = await turnoRepo.findOne({ where: { id_turno: parseInt(id, 10) } });
    if (!turno) return [null, "No se encontró el turno en el sistema."];

    if (data.descripcion !== undefined) turno.descripcion = data.descripcion;
    if (data.activo !== undefined) turno.activo = data.activo;

    const turnoActualizado = await turnoRepo.save(turno);
    return [turnoActualizado, null];
};

// ----- Eliminar turno -----

export const eliminarTurno = async (id) => {
    const turnoRepo = AppDataSource.getRepository("Turno");
    const turnoEmpleadoRepo = AppDataSource.getRepository("TurnoEmpleado");

    const turno = await turnoRepo.findOne({ where: { id_turno: id } });
    if (!turno) return [null, "Turno no encontrado."];

    const empleadosActivos = await turnoEmpleadoRepo.count({
        where: { id_turno: id, activo: true }
    });
    if (empleadosActivos > 0) {
        return [null, "No se puede eliminar el turno: aún tiene empleados activos asignados. Desvincúlelos primero."];
    }

    await turnoRepo.update(id, { activo: false });
    return [{ message: "Turno eliminado correctamente. Los registros históricos se conservan." }, null];
};

// ==================== TURNO_EMPLEADO ====================

// ----- Agregar empleado a turno -----


export const agregarEmpleadoATurno = async (id_turno, data) => {
    const turnoRepo = AppDataSource.getRepository("Turno");
    const turnoEmpleadoRepo = AppDataSource.getRepository("TurnoEmpleado");
    const usuarioRepo = AppDataSource.getRepository("Usuario");
    const asistenciaRepo = AppDataSource.getRepository("Asistencia");
    const asistenciaEmpleadoRepo = AppDataSource.getRepository("AsistenciaEmpleado");

    const turno = await turnoRepo.findOne({
        where: { id_turno, activo: true },
        relations: {
            proyecto: true
        }
    });
    if (!turno) return [null, "Turno no encontrado o inactivo."];

    const empleado = await usuarioRepo.findOne({ where: { id_usuario: data.id_empleado, activo: true } });
    if (!empleado) return [null, "Empleado no encontrado."];

    const enOtroProyecto = await _verificarEmpleadoEnOtroProyecto(
        turnoEmpleadoRepo, data.id_empleado, turno.proyecto.id_proyecto
    );
    if (enOtroProyecto) {
        return [null, "El empleado ya está activo en otro proyecto. Un empleado no puede estar en dos proyectos simultáneamente."];
    }

    const solapado = await _verificarSolapamientoHorario(
        turnoEmpleadoRepo, data.id_empleado, turno.proyecto.id_proyecto,
        turno.hora_ingreso, turno.hora_salida, id_turno
    );
    if (solapado) {
        return [null, "El empleado ya está asignado a otro turno con horario solapado en este proyecto."];
    }

    // 1. (Validación Nueva) Verificar pertenencia al proyecto
    const proyectoUsuarioRepository = AppDataSource.getRepository("ProyectoUsuario");
    const perteneceAlProyecto = await proyectoUsuarioRepository.findOne({
        where: { id_proyecto: turno.proyecto.id_proyecto, id_usuario: data.id_empleado, activo: true }
    });
    if (!perteneceAlProyecto) {
        return [null, "El empleado no pertenece formalmente al proyecto de este turno."];
    }

    // 2. (Validación Nueva) Restricción de Jerarquía: Evitar que usuarios ROOT/ADMIN marquen asistencia
    // Puedes buscar el rol directo en tu repositorio de Usuario (usuarioRepo) que ya declaraste arriba
    if (empleado.rol === "ROOT" || empleado.rol === "ADMIN" || empleado.rol === "SUPERVISOR") {
        return [null, `Acceso denegado: Los usuarios con rol ${empleado.rol} no registran marcas de asistencia ni pertenecen a mallas de turnos.`];
    }

    // 3. Creación del registro en el turno (Tu código existente) [cite: 2808]
    const hoy = new Date().toISOString().split("T")[0];
    const nuevoRegistro = turnoEmpleadoRepo.create({
        id_turno: id_turno,
        id_empleado: data.id_empleado,
        fecha_ingreso: data.fecha_ingreso ?? hoy,
        fecha_egreso: data.fecha_egreso ?? null,
        trabaja_feriados: data.trabaja_feriados ?? false,
        activo: true
    });

    const asignacionGuardada = await turnoEmpleadoRepo.save(nuevoRegistro);

    // 4. (Lógica Nueva) SOLUCIÓN AL EMPLEADO FANTASMA: Sincronización On-Demand con la Asistencia Activa de Hoy
    const asistenciaHoy = await asistenciaRepo.findOne({
        where: { turno: { id_turno }, fecha: hoy, activo: true }
    });

    if (asistenciaHoy) {
        // Si la jornada de asistencia ya fue inicializada, inyectamos de inmediato al snapshot
        const nuevoRegistroAsistencia = asistenciaEmpleadoRepo.create({
            id_asistencia: asistenciaHoy.id_asistencia,
            id_empleado: data.id_empleado,
            estado: "EN_ESPERA", // Inicia en espera para que pueda ingresar su PIN/QR [cite: 1631]
            activo: true
        });
        await asistenciaEmpleadoRepo.save(nuevoRegistroAsistencia);
    }

    return [asignacionGuardada, null];
};

// ----- Eliminar empleado de turno -----

export const eliminarEmpleadoDeTurno = async (id_turno, id_empleado) => {
    const turnoRepo = AppDataSource.getRepository("Turno");
    const turnoEmpleadoRepo = AppDataSource.getRepository("TurnoEmpleado");
    const asistenciaRepo = AppDataSource.getRepository("Asistencia");
    const asistenciaEmpleadoRepo = AppDataSource.getRepository("AsistenciaEmpleado");

    const turno = await turnoRepo.findOne({ where: { id_turno, activo: true } });
    if (!turno) return [null, "Turno no encontrado o inactivo."];

    const ahora = _obtenerHoraActual();
    if (_estaEnHorarioActivo(turno.hora_ingreso, turno.hora_salida, ahora)) {
        return [null, "No se puede desvincular a un empleado durante el horario activo del turno."];
    }

    const turnoEmpleado = await turnoEmpleadoRepo.findOne({
        where: { id_turno, id_empleado, activo: true }
    });
    if (!turnoEmpleado) return [null, "El empleado no está asignado a este turno."];

    const hoy = new Date().toISOString().split("T")[0];
    const asistenciaHoy = await asistenciaRepo.findOne({
        where: { turno: { id_turno }, fecha: hoy, activo: true }
    });

    if (asistenciaHoy) {
        const registroAsistencia = await asistenciaEmpleadoRepo.findOne({
            where: {
                asistencia: { id_asistencia: asistenciaHoy.id_asistencia },
                empleado: { id_usuario: id_empleado },
                activo: true
            }
        });

        if (registroAsistencia) {
            const estadosBloqueantes = ["PRESENTE", "ATRASO", "RETIRADO"];
            if (estadosBloqueantes.includes(registroAsistencia.estado)) {
                return [null, `No se puede desvincular: el empleado tiene estado "${registroAsistencia.estado}" en la asistencia de hoy.`];
            }

            if (registroAsistencia.estado === "EN_ESPERA") {
                return [{ requiere_confirmacion: true, id_asistencia_empleado: registroAsistencia.id_asistencia_empleado }, null];
            }
        }
    }

    await turnoEmpleadoRepo.update(
        { id_turno, id_empleado },
        { activo: false }
    );

    return [{ message: "Empleado desvinculado del turno correctamente." }, null];
};

// ----- Confirmar eliminación con baja de asistencia del día -----

export const confirmarEliminacionConAsistencia = async (id_turno, id_empleado) => {
    const turnoEmpleadoRepo = AppDataSource.getRepository("TurnoEmpleado");
    const asistenciaRepo = AppDataSource.getRepository("Asistencia");
    const asistenciaEmpleadoRepo = AppDataSource.getRepository("AsistenciaEmpleado");

    const hoy = new Date().toISOString().split("T")[0];

    const asistenciaHoy = await asistenciaRepo.findOne({
        where: { turno: { id_turno }, fecha: hoy, activo: true }
    });

    if (asistenciaHoy) {
        await asistenciaEmpleadoRepo.update(
            {
                asistencia: { id_asistencia: asistenciaHoy.id_asistencia },
                empleado: { id_usuario: id_empleado },
                estado: "EN_ESPERA"
            },
            { activo: false }
        );
    }

    await turnoEmpleadoRepo.update(
        { id_turno, id_empleado },
        { activo: false }
    );

    return [{ message: "Empleado desvinculado del turno y eliminado de la asistencia del día." }, null];
};

// ----- Configurar colaciones -----

export const configurarColacion = async (id_turno, id_empleado, data) => {
    const turnoRepo = AppDataSource.getRepository("Turno");
    const turnoEmpleadoRepo = AppDataSource.getRepository("TurnoEmpleado");

    const turno = await turnoRepo.findOne({ where: { id_turno, activo: true } });
    if (!turno) return [null, "Turno no encontrado o inactivo."];

    const turnoEmpleado = await turnoEmpleadoRepo.findOne({
        where: { id_turno, id_empleado, activo: true }
    });
    if (!turnoEmpleado) return [null, "El empleado no está asignado a este turno."];

    if (data.inicio_colacion < turno.hora_ingreso || data.fin_colacion > turno.hora_salida) {
        return [null, "Los horarios de colación deben estar dentro del rango del turno."];
    }

    const conflicto = await _validarCoberturaMinimaColacion(
        turnoEmpleadoRepo, turno, id_empleado, data.inicio_colacion, data.fin_colacion
    );
    if (conflicto) {
        return [null, `Conflicto de cobertura mínima detectado en el tramo ${conflicto}. Debe haber al menos 1 empleado disponible en todo momento.`];
    }

    turnoEmpleado.inicio_colacion = data.inicio_colacion;
    turnoEmpleado.fin_colacion = data.fin_colacion;
    const actualizado = await turnoEmpleadoRepo.save(turnoEmpleado);

    return [actualizado, null];
};

// ----- Configurar trabajo en feriados -----

export const configurarTrabajadorFeriado = async (id_turno, id_empleado, trabaja_feriados) => {
    const turnoEmpleadoRepo = AppDataSource.getRepository("TurnoEmpleado");

    const turnoEmpleado = await turnoEmpleadoRepo.findOne({
        where: { id_turno, id_empleado, activo: true }
    });
    if (!turnoEmpleado) return [null, "El empleado no está asignado a este turno."];

    turnoEmpleado.trabaja_feriados = trabaja_feriados;
    const actualizado = await turnoEmpleadoRepo.save(turnoEmpleado);

    return [actualizado, null];
};

// ==================== HELPERS PRIVADOS ====================

const _obtenerHoraActual = () => {
    const ahora = new Date();
    return `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
};

const _estaEnHorarioActivo = (hora_ingreso, hora_salida, horaActual) => {
    if (hora_salida < hora_ingreso) { // Cruza la medianoche
        return horaActual >= hora_ingreso || horaActual <= hora_salida;
    }
    return horaActual >= hora_ingreso && horaActual <= hora_salida;
};

const _verificarSolapamientoHorario = async (
    turnoEmpleadoRepo, id_empleado, id_proyecto, hora_ingreso, hora_salida, id_turno_excluir = null
) => {
    const qb = turnoEmpleadoRepo.createQueryBuilder("te")
        .innerJoin("te.turno", "t")
        .where("te.id_empleado = :id_empleado", { id_empleado })
        .andWhere("t.id_proyecto = :id_proyecto", { id_proyecto })
        .andWhere("te.activo = true")
        .andWhere("t.activo = true")
        .andWhere("(t.hora_ingreso < :hora_salida AND t.hora_salida > :hora_ingreso)", { hora_ingreso, hora_salida });

    if (id_turno_excluir) {
        qb.andWhere("t.id_turno != :id_turno_excluir", { id_turno_excluir });
    }

    const solapado = await qb.getOne();
    return !!solapado;
};

const _verificarEmpleadoEnOtroProyecto = async (turnoEmpleadoRepo, id_empleado, id_proyecto_actual) => {
    // 🌟 CORREGIDO: Uso de relaciones correctas en objetos y limpiado parámetro inútil turnoRepo
    const asignaciones = await turnoEmpleadoRepo.find({
        where: { id_empleado, activo: true },
        relations: {
            turno: {
                proyecto: true
            }
        }
    });

    for (const asig of asignaciones) {
        if (!asig.turno || !asig.turno.activo) continue;
        if (asig.turno.proyecto.id_proyecto !== id_proyecto_actual) return true;
    }
    return false;
};

const _validarCoberturaMinimaColacion = async (
    turnoEmpleadoRepo, turno, id_empleado_modificado, nuevo_inicio, nuevo_fin
) => {
    const todosEmpleados = await turnoEmpleadoRepo.find({
        where: { id_turno: turno.id_turno, activo: true }
    });

    if (todosEmpleados.length < 2) {
        return `${nuevo_inicio} - ${nuevo_fin} (se requieren al menos 2 empleados para configurar colaciones)`;
    }

    const colaciones = todosEmpleados.map((te) => {
        if (te.id_empleado === id_empleado_modificado) {
            return { inicio: nuevo_inicio, fin: nuevo_fin };
        }
        return te.inicio_colacion && te.fin_colacion
            ? { inicio: te.inicio_colacion, fin: te.fin_colacion }
            : null;
    }).filter(Boolean);

    const puntos = [...new Set(colaciones.flatMap(c => [c.inicio, c.fin]))].sort();

    for (const punto of puntos) {
        const enColacion = colaciones.filter(c => punto >= c.inicio && punto < c.fin).length;
        if (enColacion >= todosEmpleados.length) {
            return punto;
        }
    }

    return null;
};