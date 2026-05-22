import { AppDataSource } from '../../config/ConfigDB.js';

// ----- Crear -----
export const crearTurno = async (data) => {
    const turnoRepo = AppDataSource.getRepository("Turno");
    const proyectoRepo = AppDataSource.getRepository("Proyecto");
    const usuarioRepo = AppDataSource.getRepository("Usuario");

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

    // Crear el turno
    const nuevoTurno = turnoRepo.create({
        proyecto: data.id_proyecto,
        nombre: data.nombre,
        hora_ingreso: data.hora_ingreso,
        hora_salida: data.hora_salida,
        descripcion: data.descripcion ?? null,
        activo: true
    });
    const turnoGuardado = await turnoRepo.save(nuevoTurno);

    // Crear registros en TURNO_EMPLEADO para cada empleado asignado
    const turnoEmpleadoRepo = AppDataSource.getRepository("TurnoEmpleado");
    const hoy = new Date().toISOString().split("T")[0];
    const erroresEmpleados = [];

    for (const emp of data.empleados) {
        // Validar que el empleado exista y pertenezca al proyecto
        const empleado = await usuarioRepo.findOne({ where: { id_usuario: emp.id_empleado, activo: true } });
        if (!empleado) {
            erroresEmpleados.push(`Empleado con ID ${emp.id_empleado} no encontrado.`);
            continue;
        }

        // Validar que el empleado no esté en otro turno del mismo proyecto con horario solapado
        const solapado = await _verificarSolapamientoHorario(
            turnoEmpleadoRepo, turnoRepo, emp.id_empleado, data.id_proyecto,
            data.hora_ingreso, data.hora_salida, null
        );
        if (solapado) {
            erroresEmpleados.push(`El empleado ${emp.id_empleado} ya está asignado a un turno con horario solapado en este proyecto.`);
            continue;
        }

        const turnoEmpleado = turnoEmpleadoRepo.create({
            turno: turnoGuardado.id_turno,
            empleado: emp.id_empleado,
            fecha_ingreso: hoy,
            fecha_egreso: emp.fecha_egreso ?? null,
            trabaja_feriados: emp.trabaja_feriados ?? false,
            activo: true
        });
        await turnoEmpleadoRepo.save(turnoEmpleado);
    }

    if (erroresEmpleados.length > 0) {
        return [{ turno: turnoGuardado, advertencias: erroresEmpleados }, null];
    }

    return [turnoGuardado, null];
};

// ----- Búsqueda -----

export const obtenerTodosActivosPorProyecto = async (id_proyecto) => {
    const turnoRepo = AppDataSource.getRepository("Turno");
    return await turnoRepo.find({
        where: { 
            proyecto: { id_proyecto: parseInt(id_proyecto) } 
        },
        // 🌟 Mapeo de objetos anidados impecable
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
        where: { id_turno: parseInt(id) },
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

// ----- Actualizar -----

// src/modules/turno/turno.service.js

export const actualizarTurno = async (id, data) => {
    const turnoRepo = AppDataSource.getRepository("Turno");

    // 🌟 Quitamos 'activo: true' para que permita encontrarlo e interactuar con él
    const turno = await turnoRepo.findOne({ where: { id_turno: parseInt(id) } }); 
    if (!turno) return [null, "No se encontró el turno en el sistema."];

    if (data.descripcion !== undefined) turno.descripcion = data.descripcion;
    if (data.activo !== undefined) turno.activo = data.activo; // 👈 Esto te permitirá volver a pasarlo a true

    const turnoActualizado = await turnoRepo.save(turno);
    return [turnoActualizado, null];
};

// ----- Eliminar turno -----

export const eliminarTurno = async (id) => {
    const turnoRepo = AppDataSource.getRepository("Turno");
    const turnoEmpleadoRepo = AppDataSource.getRepository("TurnoEmpleado");

    const turno = await turnoRepo.findOne({ where: { id_turno: id } });
    if (!turno) return [null, "Turno no encontrado."];

    // Validar que no haya empleados activos en el turno
    const empleadosActivos = await turnoEmpleadoRepo.count({
        where: { turno: { id_turno: id }, activo: true }
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

    const turno = await turnoRepo.findOne({
        where: { id_turno, activo: true },
        relations: ["proyecto"]
    });
    if (!turno) return [null, "Turno no encontrado o inactivo."];

    const empleado = await usuarioRepo.findOne({ where: { id_usuario: data.id_empleado, activo: true } });
    if (!empleado) return [null, "Empleado no encontrado."];

    // Validar que el empleado no esté en otro proyecto activo simultáneamente
    const enOtroProyecto = await _verificarEmpleadoEnOtroProyecto(
        turnoEmpleadoRepo, turnoRepo, data.id_empleado, turno.proyecto.id_proyecto
    );
    if (enOtroProyecto) {
        return [null, "El empleado ya está activo en otro proyecto. Un empleado no puede estar en dos proyectos simultáneamente."];
    }

    // Validar solapamiento de horario dentro del mismo proyecto
    const solapado = await _verificarSolapamientoHorario(
        turnoEmpleadoRepo, turnoRepo, data.id_empleado, turno.proyecto.id_proyecto,
        turno.hora_ingreso, turno.hora_salida, id_turno
    );
    if (solapado) {
        return [null, "El empleado ya está asignado a otro turno con horario solapado en este proyecto."];
    }

    const hoy = new Date().toISOString().split("T")[0];
    const nuevoRegistro = turnoEmpleadoRepo.create({
        turno: id_turno,
        empleado: data.id_empleado,
        fecha_ingreso: data.fecha_ingreso ?? hoy,
        fecha_egreso: data.fecha_egreso ?? null,
        trabaja_feriados: data.trabaja_feriados ?? false,
        activo: true
    });

    return [await turnoEmpleadoRepo.save(nuevoRegistro), null];
};

// ----- Eliminar empleado de turno -----

export const eliminarEmpleadoDeTurno = async (id_turno, id_empleado) => {
    const turnoRepo = AppDataSource.getRepository("Turno");
    const turnoEmpleadoRepo = AppDataSource.getRepository("TurnoEmpleado");
    const asistenciaRepo = AppDataSource.getRepository("Asistencia");
    const asistenciaEmpleadoRepo = AppDataSource.getRepository("AsistenciaEmpleado");

    const turno = await turnoRepo.findOne({ where: { id_turno, activo: true } });
    if (!turno) return [null, "Turno no encontrado o inactivo."];

    // Validar que la acción se ejecute fuera del horario activo del turno
    const ahora = _obtenerHoraActual();
    if (_estaEnHorarioActivo(turno.hora_ingreso, turno.hora_salida, ahora)) {
        return [null, "No se puede desvincular a un empleado durante el horario activo del turno."];
    }

    const turnoEmpleado = await turnoEmpleadoRepo.findOne({
        where: { turno: { id_turno }, empleado: { id_usuario: id_empleado }, activo: true }
    });
    if (!turnoEmpleado) return [null, "El empleado no está asignado a este turno."];

    // Verificar si existe asistencia activa hoy para este turno (requisito 8 de Asistencia)
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
                // Retornar señal para que el controller pida confirmación al frontend
                return [{ requiere_confirmacion: true, id_asistencia_empleado: registroAsistencia.id_asistencia_empleado }, null];
            }
            // Para FALTA_JUSTIFICADA o FALTA_INJUSTIFICADA: desvincula pero conserva historial
        }
    }

    await turnoEmpleadoRepo.update(
        { turno: { id_turno }, empleado: { id_usuario: id_empleado } },
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
        { turno: { id_turno }, empleado: { id_usuario: id_empleado } },
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
        where: { turno: { id_turno }, empleado: { id_usuario: id_empleado }, activo: true }
    });
    if (!turnoEmpleado) return [null, "El empleado no está asignado a este turno."];

    // Validar que los horarios de colación estén dentro del rango del turno
    if (data.inicio_colacion < turno.hora_ingreso || data.fin_colacion > turno.hora_salida) {
        return [null, "Los horarios de colación deben estar dentro del rango del turno."];
    }

    // Validar cobertura mínima: en todo momento debe haber al menos 1 empleado disponible
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
        where: { turno: { id_turno }, empleado: { id_usuario: id_empleado }, activo: true }
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
    return horaActual >= hora_ingreso && horaActual <= hora_salida;
};

const _verificarSolapamientoHorario = async (
    turnoEmpleadoRepo, turnoRepo, id_empleado, id_proyecto, hora_ingreso, hora_salida, id_turno_excluir
) => {
    const asignaciones = await turnoEmpleadoRepo.find({
        where: { empleado: { id_usuario: id_empleado }, activo: true },
        relations: ["turno", "turno.proyecto"]
    });

    for (const asig of asignaciones) {
        if (!asig.turno.activo) continue;
        if (asig.turno.proyecto.id_proyecto !== id_proyecto) continue;
        if (id_turno_excluir && asig.turno.id_turno === id_turno_excluir) continue;

        const solapa = hora_ingreso < asig.turno.hora_salida && hora_salida > asig.turno.hora_ingreso;
        if (solapa) return true;
    }
    return false;
};

const _verificarEmpleadoEnOtroProyecto = async (turnoEmpleadoRepo, turnoRepo, id_empleado, id_proyecto_actual) => {
    const asignaciones = await turnoEmpleadoRepo.find({
        where: { empleado: { id_usuario: id_empleado }, activo: true },
        relations: ["turno", "turno.proyecto"]
    });

    for (const asig of asignaciones) {
        if (!asig.turno.activo) continue;
        if (asig.turno.proyecto.id_proyecto !== id_proyecto_actual) return true;
    }
    return false;
};

const _validarCoberturaMinimaColacion = async (
    turnoEmpleadoRepo, turno, id_empleado_modificado, nuevo_inicio, nuevo_fin
) => {
    const todosEmpleados = await turnoEmpleadoRepo.find({
        where: { turno: { id_turno: turno.id_turno }, activo: true },
        relations: ["empleado"]
    });

    if (todosEmpleados.length < 2) {
        return `${nuevo_inicio} - ${nuevo_fin} (se requieren al menos 2 empleados para configurar colaciones)`;
    }

    // Construir lista de colaciones simulando el cambio
    const colaciones = todosEmpleados.map((te) => {
        if (te.empleado.id_usuario === id_empleado_modificado) {
            return { inicio: nuevo_inicio, fin: nuevo_fin };
        }
        return te.inicio_colacion && te.fin_colacion
            ? { inicio: te.inicio_colacion, fin: te.fin_colacion }
            : null;
    }).filter(Boolean);

    // Recolectar puntos de tiempo únicos para evaluar cobertura
    const puntos = [...new Set(colaciones.flatMap(c => [c.inicio, c.fin]))].sort();

    for (const punto of puntos) {
        const enColacion = colaciones.filter(c => punto >= c.inicio && punto < c.fin).length;
        if (enColacion >= todosEmpleados.length) {
            return punto;
        }
    }

    return null;
};