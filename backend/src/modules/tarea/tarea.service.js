import { AppDataSource } from '../../config/ConfigDB.js';

// ----- Crear -----
export const programarTarea = async (data, id_programador) => {
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");
    const actRepo = AppDataSource.getRepository("Actividad");

    const actividad = await actRepo.findOne({ where: { id_act: data.id_act, activo: true } });
    if (!actividad) return [null, "La actividad no existe o está inactiva."];

    const nueva = tareaRepo.create({
        actividad: data.id_act,
        programador: id_programador,
        fecha: data.fecha,
        hora: data.hora,
        estado: "PLANIFICADA", // Por defecto al crear
        comentario: data.comentario
    });

    return [await tareaRepo.save(nueva), null];
};

// ----- Buscar (Todas las tareas del sistema) -----
export const obtenerTodas = async () => {
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");
    return await tareaRepo.find({ 
        relations: {
            actividad: true,
            programador: true,
            asignaciones: { empleado: true },
            evaluaciones: { empleado: true } // Necesario para saber si ya se evaluó a alguien en esta tarea
        },
        order: {
            fecha: "ASC",
            hora: "ASC"
        }
    });
};

export const obtenerPorId = async (id) => {
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");
    const tarea = await tareaRepo.findOne({ 
        where: { id_tarea: id }, 
        relations: { actividad: true } 
    });
    if (!tarea) return [null, "Tarea no encontrada"];
    return [tarea, null];
};

//----- Actualizar -----
export const actualizarTarea = async (id, data) => {
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");
    const tarea = await tareaRepo.findOne({ where: { id_tarea: id } });

    if (!tarea) return [null, "Tarea no encontrada para actualizar"];
    if (tarea.estado === "FINALIZADA" || tarea.estado === "CANCELADA") {
        return [null, "No se puede modificar una tarea finalizada o cancelada."];
    }

    if (data.fecha) tarea.fecha = data.fecha;
    if (data.hora) tarea.hora = data.hora;
    if (data.comentario !== undefined) tarea.comentario = data.comentario;

    return [await tareaRepo.save(tarea), null];
};

// ----- Eliminar -----
export const eliminarTarea = async (id) => {
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");
    const tarea = await tareaRepo.findOne({ where: { id_tarea: id } });

    if (!tarea) return [null, "Tarea no encontrada"];

    // No se puede eliminar si está en proceso
    if (tarea.estado === "EN_PROCESO") {
        return [null, "ESTADO_EN_PROCESO_NO_ELIMINABLE"];
    }
    await tareaRepo.delete(id);
    return [{ message: "Tarea eliminada con éxito" }, null];
};

// ----- Cancelar -----
export const cancelarTarea = async (id, data) => {
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");
    const tarea = await tareaRepo.findOne({ where: { id_tarea: id } });

    if (!tarea) return [null, "Tarea no encontrada"];
    if (tarea.estado === "EN_PROCESO" && data.estado !== "INCOMPLETA") return [null, "No se puede cancelar una tarea que está EN_PROCESO, solo marcrla como INCOMPLETA"];

    tarea.estado = data.estado; 
    tarea.comentario = data.comentario;

    return [await tareaRepo.save(tarea), null];
};

// ----- Completar (el propio empleado marca su tarea como realizada) -----
export const completarTarea = async (idTarea, idEmpleado) => {
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");

    const tarea = await tareaRepo.findOne({
        where: { id_tarea: idTarea },
        relations: { asignaciones: { empleado: true } },
    });

    if (!tarea) return [null, "Tarea no encontrada"];

    // Misma regla que obtenerMisTareas: solo la asignación más reciente
    // (por hora_asignacion) es la vigente. Así, si la tarea fue reasignada
    // a otra persona, el empleado anterior ya no puede marcarla como
    // completada aunque conserve el id_tarea.
    const asignacionVigente = [...(tarea.asignaciones ?? [])]
        .sort((a, b) => new Date(b.hora_asignacion) - new Date(a.hora_asignacion))[0];

    if (!asignacionVigente || asignacionVigente.empleado?.id_usuario !== idEmpleado) {
        return [null, "Esta tarea no está asignada actualmente a tu usuario."];
    }

    if (tarea.estado !== "EN_PROCESO") {
        if (["FINALIZADA", "CANCELADA", "INCOMPLETA"].includes(tarea.estado)) {
            return [null, `No se puede completar: la tarea ya está en estado ${tarea.estado}.`];
        }
        return [null, `No se puede completar: la tarea aún no está EN_PROCESO (estado actual: ${tarea.estado}). Debe esperar a que comience su horario programado.`];
    }

    tarea.estado = "FINALIZADA";
    return [await tareaRepo.save(tarea), null];
};

// ----- Empleados disponibles para asignar (según turno vigente a la fecha/hora de la tarea) -----
export const obtenerEmpleadosDisponibles = async (idTarea) => {
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");
    const turnoRepo = AppDataSource.getRepository("Turno");
    const turnoEmpleadoRepo = AppDataSource.getRepository("TurnoEmpleado");

    const tarea = await tareaRepo.findOne({
        where: { id_tarea: idTarea },
        relations: { actividad: { proyecto: true } },
    });
    if (!tarea) return [null, "Tarea no encontrada"];

    const idProyecto = tarea.actividad?.proyecto?.id_proyecto;
    if (!idProyecto) return [null, "La actividad de esta tarea no tiene un proyecto asociado."];

    const horaTarea = tarea.hora?.length === 5 ? `${tarea.hora}:00` : tarea.hora;
    const fechaTarea = tarea.fecha;

    // Turnos activos del proyecto cuyo rango horario cubre la hora de la tarea
    const turnos = await turnoRepo.find({
        where: { proyecto: { id_proyecto: idProyecto }, activo: true },
    });

    const turnosQueCubren = turnos.filter((t) =>
        _estaEnHorarioActivo(t.hora_ingreso, t.hora_salida, horaTarea)
    );

    if (turnosQueCubren.length === 0) return [[], null];

    const idsTurnos = turnosQueCubren.map((t) => t.id_turno);

    // Empleados vinculados a esos turnos, vigentes para la fecha de la tarea
    const vinculos = await turnoEmpleadoRepo.find({
        where: idsTurnos.map((id_turno) => ({ id_turno, activo: true })),
        relations: { empleado: true },
    });

    const vigentesEnFecha = vinculos.filter((v) => {
        if (v.fecha_ingreso && v.fecha_ingreso > fechaTarea) return false;
        if (v.fecha_egreso && v.fecha_egreso < fechaTarea) return false;
        return true;
    });

    // Ppuede estar en más de un turno que cubra la hora
    const empleadosMap = new Map();
    for (const v of vigentesEnFecha) {
        const emp = v.empleado;
        if (emp && emp.activo && !empleadosMap.has(emp.id_usuario)) {
            empleadosMap.set(emp.id_usuario, emp);
        }
    }

    return [Array.from(empleadosMap.values()), null];
};

const _estaEnHorarioActivo = (hora_ingreso, hora_salida, hora) => {
    if (hora_salida < hora_ingreso) { // Turno nocturno que cruza la medianoche
        return hora >= hora_ingreso || hora <= hora_salida;
    }
    return hora >= hora_ingreso && hora <= hora_salida;
};

// ----- Mis Tareas (Filtro por empleado con relaciones en cascada) -----
export async function obtenerMisTareas(idEmpleado) {
    const asignacionRepository = AppDataSource.getRepository("AsignacionTarea");

    const asignaciones = await asignacionRepository.find({
        where: {
            empleado: {
                id_usuario: idEmpleado,
            },
        },
        relations: {
            tarea: {
                actividad: true,
                asignaciones: {
                    empleado: true,
                },
            },
            asignador: true,
        },
        order: {
            hora_asignacion: "DESC",
        },
    });

    // Si la tarea fue reasignada a otra persona después de esta asignación,
    // esta ya no es la vigente -> no debe seguir apareciendo en "Mis Tareas"
    // del empleado anterior
    const asignacionesVigentes = asignaciones.filter((asignacion) => {
        const vigente = [...(asignacion.tarea.asignaciones ?? [])]
            .sort((a, b) => new Date(b.hora_asignacion) - new Date(a.hora_asignacion))[0];
        return vigente?.empleado?.id_usuario === idEmpleado;
    });

    // Transformamos la respuesta para no exponer información sensible
    // de otros trabajadores.
    return asignacionesVigentes.map(asignacion => ({

        id_asignacion: asignacion.id_asignacion,
        tipo_asignacion: asignacion.tipo_asignacion,
        hora_asignacion: asignacion.hora_asignacion,

        asignador: asignacion.asignador && {
            id_usuario: asignacion.asignador.id_usuario,
            nombre: asignacion.asignador.nombre,
            apellido: asignacion.asignador.apellido,
            rol: asignacion.asignador.rol,
        },

        tarea: {
            id_tarea: asignacion.tarea.id_tarea,
            fecha: asignacion.tarea.fecha,
            hora: asignacion.tarea.hora,
            estado: asignacion.tarea.estado,
            comentario: asignacion.tarea.comentario,

            actividad: asignacion.tarea.actividad,
        },

    }));

}