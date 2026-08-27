import { AppDataSource } from '../../config/ConfigDB.js';

// ----- Buscar -----
export const obtenerTodas = async () => {
    const califRepo = AppDataSource.getRepository("CalificacionEmpleado");
    return await califRepo.find({ where: { activo: true }, relations: { categoria: true, empleado: true } });
};

export const obtenerPorId = async (id) => {
    const califRepo = AppDataSource.getRepository("CalificacionEmpleado");
    const calificacion = await califRepo.findOne({ where: { id_calificacion: id }, relations: { categoria: true, empleado: true } });
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
        categoria: {id_cat: data.id_cat},
        empleado: {id_usuario: data.id_empleado},
        otorga: {id_usuario: id_otorga},
        fecha_otorgamiento: new Date()
    });

    return [await califRepo.save(nueva), null];
};

// quitar calificacion (con cascade sobre asignaciones)
export const revocarCalificacion = async (id) => {
    const califRepo = AppDataSource.getRepository("CalificacionEmpleado");
    const asignRepo = AppDataSource.getRepository("AsignacionTarea");
    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");

    const calificacion = await califRepo.findOne({
        where: { id_calificacion: id },
        relations: { categoria: true, empleado: true },
    });
    if (!calificacion) return [null, "Calificación no encontrada."];
    if (!calificacion.activo) return [null, "La calificación ya estaba revocada."];

    const idCat = calificacion.categoria?.id_cat;
    const idEmpleado = calificacion.empleado?.id_usuario;

    // Asignaciones del empleado a tareas cuya actividad pertenece a la
    // categoría de esta certificación, en estados aún vigentes.
    const asignacionesAfectadas = (idCat && idEmpleado)
        ? await asignRepo.createQueryBuilder("a")
            .innerJoinAndSelect("a.tarea", "t")
            .innerJoin("t.actividad", "act")
            .innerJoin("act.categoria", "cat")
            .innerJoin("a.empleado", "emp")
            .where("emp.id_usuario = :idEmpleado", { idEmpleado })
            .andWhere("cat.id_cat = :idCat", { idCat })
            .andWhere("t.estado IN (:...estados)", { estados: ["ASIGNADA", "EN_PROCESO"] })
            .getMany()
        : [];

    // Revocar la certificación
    await califRepo.update(id, { activo: false });

    // Cascada: quitar cada asignación y, si la tarea queda sin responsables,
    // devolverla a PLANIFICADA para reasignarla a alguien certificado.
    let tareasLiberadas = 0;
    for (const a of asignacionesAfectadas) {
        const idTarea = a.tarea.id_tarea;
        await asignRepo.delete(a.id_asignacion);

        const restantes = await asignRepo.count({ where: { tarea: { id_tarea: idTarea } } });
        if (restantes === 0) {
            await tareaRepo.update(idTarea, {
                estado: "PLANIFICADA",
                comentario: "Reabierta automáticamente: el empleado asignado perdió la certificación requerida.",
            });
            tareasLiberadas++;
        }
    }

    const extra = asignacionesAfectadas.length > 0
        ? ` Se retiraron ${asignacionesAfectadas.length} asignación(es); ${tareasLiberadas} tarea(s) volvieron a PLANIFICADA.`
        : "";

    return [{ message: `Calificación revocada correctamente.${extra}` }, null];
};

// Buscar por categoria
export const obtenerEmpleadosPorCategoria = async (id_cat) => {
    const califRepo = AppDataSource.getRepository("CalificacionEmpleado");
    
    const calificaciones = await califRepo.find({
        where: { 
            categoria: { id_cat: id_cat }, 
            activo: true 
        },
        relations: { empleado: true, categoria: true } 
    });

    return [calificaciones ?? [], null];
};