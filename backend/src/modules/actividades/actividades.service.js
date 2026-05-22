import { AppDataSource } from '../../config/ConfigDB.js';
import { ILike } from "typeorm";

// ----- Crear -----
export const crearActividad = async(data) => {
    const actRepo = AppDataSource.getRepository("Actividad");
    const catRepo = AppDataSource.getRepository("Categoria");

    const categoria = await catRepo.findOne({ where: { id_cat: data.id_cat, activo: true } });
    if (!categoria) return [null, "La categoría especificada no existe o no se encuentra activa."];

    const nuevaActividad = actRepo.create({
        descripcion_esp: data.descripcion_esp,
        recurrencia: data.recurrencia,
        categoria: data.id_cat,
        proyecto: data.id_proyecto
    });

    const guardada = await actRepo.save(nuevaActividad);
    return [guardada, null];
};

// ----- Busqueda -----

export const obtenerTodosActivos = async () => {
    const actRepo = AppDataSource.getRepository("Actividad");
    return await actRepo.find({ 
        where: { activo: true },
        relations: {
            categoria: true,
            proyecto: true
        }
    });
};

export const obtenerPorID = async (id) => {
    const actRepo = AppDataSource.getRepository("Actividad");
    const actividad = await actRepo.findOne({ 
        where: { id_act: parseInt(id) },
        relations: {
            categoria: true,
            proyecto: true
        }
    });

    if (!actividad) return [null, "Registro de actividad no encontrado"];
    return [actividad, null];
};

export const buscarDinamico = async (termino) => {
    const actRepo = AppDataSource.getRepository("Actividad");
    return await actRepo.find({
        where: { descripcion_esp: ILike(`%${termino}%`), activo: true },
        relations: {
            categoria: true
        }
    });
};

// ----- Actualizar -----

export const actualizarActividad = async (id, data) => {
    const actRepo = AppDataSource.getRepository("Actividad");
    const catRepo = AppDataSource.getRepository("Categoria");

    const actividad = await actRepo.findOne({ where: { id_act: parseInt(id) } });

    if (!actividad) {
        return [null, "No se encontró la actividad para actualizar"];
    }
    if (data.id_cat) {
        const categoria = await catRepo.findOne({ where: { id_cat: data.id_cat, activo: true } });
        if (!categoria) return [null, "La nueva categoría especificada no existe o está inactiva"];
        
        actividad.categoria = data.id_cat;
    }
    if (data.descripcion_esp) actividad.descripcion_esp = data.descripcion_esp;
    if (data.recurrencia) actividad.recurrencia = data.recurrencia;
    if (data.id_proyecto) actividad.proyecto = data.id_proyecto;

    const actividadActualizada = await actRepo.save(actividad);
    return [actividadActualizada, null];
};

// ----- Eliminar -----

export const eliminarDelCatalogo = async (id) => {
    const actRepo = AppDataSource.getRepository("Actividad");
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");

    const actividad = await actRepo.findOne({ where: { id_act: parseInt(id) } });
    if (!actividad) return [null, "Actividad no encontrada."];

    // cuenta las tareas en proceso
    const tareasEnProceso = await tareaRepo.count({ 
        where: { actividad: { id_act: parseInt(id) }, estado: "EN_PROCESO" } 
    });

    if (tareasEnProceso > 0) {
        return [null, "No se puede eliminar: hay tareas ejecutándose actualmente (EN_PROCESO)."];
    }

    await actRepo.update(parseInt(id), { activo: false });
    
    // cambia el estado a cancelada
    await tareaRepo.update(
        { actividad: { id_act: parseInt(id) }, estado: "PLANIFICADA" }, 
        { estado: "CANCELADA", comentario: "Actividad base eliminada del catálogo." }
    );

    return [{ message: "Desactivación y cancelación en cascada completadas con éxito" }, null];
};