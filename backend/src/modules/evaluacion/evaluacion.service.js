import { AppDataSource } from '../../config/ConfigDB.js';

// ----- Crear -----
export const crearEvaluacion = async (data, id_evaluador) => {
    const evalRepo = AppDataSource.getRepository("EvaluacionDesempeno");
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");
    const asignRepo = AppDataSource.getRepository("AsignacionTarea");
    const userRepo = AppDataSource.getRepository("Usuario");

    const tarea = await tareaRepo.findOne({ where: { id_tarea: data.id_tarea } });
    if (!tarea) return [null, "La tarea especificada no existe."];

    const empleado = await userRepo.findOne({ where: { id_usuario: data.id_empleado } });
    if (!empleado) return [null, "El empleado especificado no existe."];

    // Solo se puede evaluar a alguien que estuvo asignado a la tarea
    const huboAsignacion = await asignRepo.findOne({
        where: {
            tarea: { id_tarea: data.id_tarea },
            empleado: { id_usuario: data.id_empleado },
        },
    });
    if (!huboAsignacion) {
        return [null, "Este empleado nunca estuvo asignado a esta tarea, no se puede evaluar."];
    }

    const yaEvaluado = await evalRepo.findOne({
        where: {
            tarea: { id_tarea: data.id_tarea },
            empleado: { id_usuario: data.id_empleado },
            activo: true,
        },
    });
    if (yaEvaluado) {
        return [null, "Ya existe una evaluación activa para este empleado en esta tarea. Revócala primero si necesitas registrar una nueva."];
    }

    const nueva = evalRepo.create({
        tarea: { id_tarea: data.id_tarea },
        empleado: { id_usuario: data.id_empleado },
        evaluador: { id_usuario: id_evaluador },
        cumplio: data.cumplio,
        calificacion: data.calificacion,
        comentario: data.comentario ?? null,
        fecha_evaluacion: new Date(),
    });

    return [await evalRepo.save(nueva), null];
};

// ----- Hoja de vida de un empleado -----
export const obtenerPorEmpleado = async (id_empleado) => {
    const evalRepo = AppDataSource.getRepository("EvaluacionDesempeno");
    return await evalRepo.find({
        where: { empleado: { id_usuario: id_empleado }, activo: true },
        relations: { tarea: { actividad: true }, evaluador: true },
        order: { fecha_evaluacion: "DESC" },
    });
};

// ----- Evaluaciones de una tarea puntual -----
export const obtenerPorTarea = async (id_tarea) => {
    const evalRepo = AppDataSource.getRepository("EvaluacionDesempeno");
    return await evalRepo.find({
        where: { tarea: { id_tarea: id_tarea }, activo: true },
        relations: { empleado: true, evaluador: true },
        order: { fecha_evaluacion: "DESC" },
    });
};

// ----- Revocar (soft delete, para no perder el historial) -----
export const revocarEvaluacion = async (id) => {
    const evalRepo = AppDataSource.getRepository("EvaluacionDesempeno");
    const evaluacion = await evalRepo.findOne({ where: { id_evaluacion: id } });

    if (!evaluacion) return [null, "Evaluación no encontrada."];
    if (!evaluacion.activo) return [null, "Esta evaluación ya se encuentra revocada."];

    await evalRepo.update(id, { activo: false });
    return [{ message: "Evaluación revocada con éxito" }, null];
};
