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

// ----- Buscar -----
export const obtenerTodas = async () => {
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");
    return await tareaRepo.find({ relations: {actividad: true} });
};

export const obtenerPorId = async (id) => {
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");
    const tarea = await tareaRepo.findOne({ where: { id_tarea: id }, relations: {actividad: true} });
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

    //No se puede eliminar si está en proceso
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
    if (tarea.estado === "EN_PROCESO") return [null, "No se puede cancelar una tarea que está EN_PROCESO."];

    tarea.estado = data.estado; 
    tarea.comentario = data.comentario;

    return [await tareaRepo.save(tarea), null];
};