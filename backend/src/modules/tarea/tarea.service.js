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

    if (["FINALIZADA", "CANCELADA", "INCOMPLETA"].includes(tarea.estado)) {
        return [null, `No se puede completar: la tarea ya está en estado ${tarea.estado}.`];
    }

    tarea.estado = "FINALIZADA";
    return [await tareaRepo.save(tarea), null];
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

    // Transformamos la respuesta para no exponer información sensible
    // de otros trabajadores.
    return asignaciones.map(asignacion => ({

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

            // Solo la asignación vigente de cada tarea 
            // Sin este filtro, tras una reasignación seguirían apareciendo empleados que ya no están a cargo de la tarea.
            equipo: [asignacion.tarea.asignaciones].flat()
                .sort((a, b) => new Date(b.hora_asignacion) - new Date(a.hora_asignacion))
                .slice(0, 1)
                .map(companero => ({
                    id_usuario: companero.empleado.id_usuario,
                    nombre: companero.empleado.nombre,
                    apellido: companero.empleado.apellido,
                    rol: companero.empleado.rol,
                })),
        },

    }));

}