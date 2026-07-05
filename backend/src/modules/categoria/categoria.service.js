import { AppDataSource } from '../../config/ConfigDB.js';

// ----- Crear -----
export const crearCategoria = async (data) => {
    const catRepo = AppDataSource.getRepository("Categoria");
    const existe = await catRepo.findOne({ where: { nombre: data.nombre } });
    if (existe) {
        // Si existe pero esta inactiva, la resucitamos y actualizamos sus datos
        if (!existe.activo) {
            existe.activo = true;
            if (data.descripcion !== undefined) existe.descripcion = data.descripcion;
            if (data.requiere_calificacion !== undefined) existe.requiere_calificacion = data.requiere_calificacion;
            
            return [await catRepo.save(existe), null];
        }
        //Si existe y esta activa se bloquea
        return [null, "Ya existe una categoría con este nombre."];
    }
    const nueva = catRepo.create(data);
    return [await catRepo.save(nueva), null];
};

// ----- Busqueda -----
export const obtenerTodas = async (incluirInactivas = false) => {
    const catRepo = AppDataSource.getRepository("Categoria");
    return await catRepo.find({ where: incluirInactivas ? {} : { activo: true } });
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

// ----- Ractivar -----
export const reactivarCategoria = async (id) => {
    const catRepo = AppDataSource.getRepository("Categoria");
    
    const categoria = await catRepo.findOne({ where: { id_cat: id } });
    if (!categoria) return [null, "Categoría no encontrada."];
    
    if (categoria.activo) return [null, "La categoría ya se encuentra activa."];

    await catRepo.update(id, { activo: true }); 
    return [{ message: "Categoría reactivada con éxito" }, null];
};