import { AppDataSource } from '../config/configBd.js';

// ----- Buscar -----
export const obtenerTodas = async () => {
    const califRepo = AppDataSource.getRepository("CalificacionEmpleado");
    return await califRepo.find({ where: { activo: true }, relations: ["categoria", "empleado"] });
};

export const obtenerPorId = async (id) => {
    const califRepo = AppDataSource.getRepository("CalificacionEmpleado");
    const calificacion = await califRepo.findOne({ where: { id_calificacion: id }, relations: ["categoria", "empleado"] });
    if (!calificacion) return [null, "Calificación no encontrada"];
    return [calificacion, null];
};

// Dar calificacion a empleado
export const otorgarCalificacion = async (data, id_otorga) => {
    const califRepo = AppDataSource.getRepository("CalificacionEmpleado");
    const catRepo = AppDataSource.getRepository("Categoria");
    const userRepo = AppDataSource.getRepository("Usuario");

    const categoria = await catRepo.findOne({ where: { id_cat: data.id_cat, activo: true } });
    if (!categoria) return [null, "Categoría inválida."];
    if (!categoria.requiere_calificacion) return [null, "Esta categoría no requiere calificaciones especiales."];

    const empleado = await userRepo.findOne({ where: { id_usuario: data.id_empleado, activo: true } });
    if (!empleado) return [null, "Empleado inválido."];

    // Evitar duplicados
    const existe = await califRepo.findOne({ where: { categoria: { id_cat: data.id_cat }, empleado: { id_usuario: data.id_empleado }, activo: true } });
    if (existe) return [null, "El empleado ya posee esta calificación."];

    const nueva = califRepo.create({
        categoria: data.id_cat,
        empleado: data.id_empleado,
        otorga: id_otorga,
        fecha_otorgamiento: new Date()
    });

    return [await califRepo.save(nueva), null];
};

// quitar calificacion
export const revocarCalificacion = async (id) => {
    const califRepo = AppDataSource.getRepository("CalificacionEmpleado");
    const calificacion = await califRepo.findOne({ where: { id_calificacion: id } });

    if (!calificacion) return [null, "Calificación no encontrada."];

    await califRepo.update(id, { activo: false });
    return [{ message: "Calificación revocada correctamente" }, null];
};