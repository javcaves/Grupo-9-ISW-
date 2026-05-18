import { AppDataSource } from '../config/configBd.js';

// ----- Asignar tarea -----
export const asignarTarea = async (data, id_asignador) => {
    const asignRepo = AppDataSource.getRepository("AsignacionTarea");
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");
    const califRepo = AppDataSource.getRepository("CalificacionEmpleado");
    const userRepo = AppDataSource.getRepository("Usuario");

    // Validar Tarea y sus anidaciones
    const tarea = await tareaRepo.findOne({ 
        where: { id_tarea: data.id_tarea },
        relations: ["actividad", "actividad.categoria"] 
    });

    if (!tarea || tarea.estado === "CANCELADA") return [null, "La tarea no existe o está cancelada."];

    // Validar Empleado
    const empleado = await userRepo.findOne({ where: { id_usuario: data.id_empleado, activo: true } });
    if (!empleado) return [null, "El empleado no existe o está inactivo."];

    // Validar Calificación
    if (tarea.actividad.categoria.requiere_calificacion) {
        const calificacion = await califRepo.findOne({
            where: { 
                empleado: { id_usuario: data.id_empleado }, 
                categoria: { id_cat: tarea.actividad.categoria.id_cat },
                activo: true
            }
        });
        if (!calificacion) {
            return [null, `El empleado no tiene la calificación requerida para la categoría: ${tarea.actividad.categoria.nombre}`];
        }
    }

    const nueva = asignRepo.create({
        tarea: data.id_tarea,
        empleado: data.id_empleado,
        asignador: id_asignador,
        tipo_asignacion: data.tipo_asignacion,
        hora_asignacion: new Date()
    });

    return [await asignRepo.save(nueva), null];
};

// ----- Buacar -----
export const obtenerTodas = async () => {
    const asignRepo = AppDataSource.getRepository("AsignacionTarea");
    return await asignRepo.find({ relations: ["tarea", "empleado", "asignador"] });
};

export const obtenerPorId = async (id) => {
    const asignRepo = AppDataSource.getRepository("AsignacionTarea");
    const asignacion = await asignRepo.findOne({ where: { id_asignacion: id }, relations: ["tarea", "empleado"] });
    if (!asignacion) return [null, "Asignación no encontrada"];
    return [asignacion, null];
};

// ----- Actualizar -----
export const actualizarAsignacion = async (id, data) => {
    const asignRepo = AppDataSource.getRepository("AsignacionTarea");
    const asignacion = await asignRepo.findOne({ where: { id_asignacion: id } });

    if (!asignacion) return [null, "Asignación no encontrada"];

    if (data.id_empleado) asignacion.empleado = data.id_empleado;
    if (data.tipo_asignacion) asignacion.tipo_asignacion = data.tipo_asignacion;

    return [await asignRepo.save(asignacion), null];
};

// ----- Eliminar -----
export const eliminarAsignacion = async (id) => {
    const asignRepo = AppDataSource.getRepository("AsignacionTarea");
    const asignacion = await asignRepo.findOne({ where: { id_asignacion: id } });

    if (!asignacion) return [null, "Asignación no encontrada."];
    
    await asignRepo.delete(id);
    return [{ message: "Asignación eliminada con éxito" }, null];
};