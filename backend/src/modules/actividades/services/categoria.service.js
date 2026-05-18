import { AppDataSource } from '../config/configBd.js';

// ----- Crear -----
export const crearCategoria = async (data) => {
    const catRepo = AppDataSource.getRepository("Categoria");
    const existe = await catRepo.findOne({ where: { nombre: data.nombre } });
    if (existe) return [null, "Ya existe una categoría con este nombre."];

    const nueva = catRepo.create(data);
    return [await catRepo.save(nueva), null];
};

// ----- Busqueda -----
export const obtenerTodas = async () => {
    const catRepo = AppDataSource.getRepository("Categoria");
    return await catRepo.find({ where: { activo: true } });
};

export const obtenerPorId = async (id) => {
    const catRepo = AppDataSource.getRepository("Categoria");
    const categoria = await catRepo.findOne({ where: { id_cat: id } });
    if (!categoria) return [null, "Categoría no encontrada"];
    return [categoria, null];
};

// ----- Actualizar -----
export const actualizarCategoria = async (id, data) => {
    const catRepo = AppDataSource.getRepository("Categoria");
    const categoria = await catRepo.findOne({ where: { id_cat: id } });

    if (!categoria) return [null, "Categoría no encontrada para actualizar"];

    if (data.nombre && data.nombre !== categoria.nombre) {
        const existe = await catRepo.findOne({ where: { nombre: data.nombre } });
        if (existe) return [null, "El nuevo nombre ya está en uso."];
        categoria.nombre = data.nombre;
    }

    if (data.descripcion !== undefined) categoria.descripcion = data.descripcion;
    if (data.requiere_calificacion !== undefined) categoria.requiere_calificacion = data.requiere_calificacion;

    const actualizada = await catRepo.save(categoria);
    return [actualizada, null];
};

// ----- Eliminar -----
export const eliminarCategoria = async (id) => {
    const catRepo = AppDataSource.getRepository("Categoria");
    const actRepo = AppDataSource.getRepository("Actividad");

    const categoria = await catRepo.findOne({ where: { id_cat: id } });
    if (!categoria) return [null, "Categoría no encontrada."];

    const actividadesActivas = await actRepo.count({ 
        where: { categoria: { id_cat: id }, activo: true } 
    });
    
    if (actividadesActivas > 0) {
        return [null, "No se puede eliminar: tiene actividades activas asociadas."];
    }

    await catRepo.update(id, { activo: false }); 
    return [{ message: "Categoría desactivada con éxito" }, null];
};