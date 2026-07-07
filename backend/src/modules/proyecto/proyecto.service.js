/**
 * @typedef {Object} Proyecto
 * @property {number} id_proyecto - Identificador único autoincremental
 * @property {string} nombre_proy - Nombre descriptivo del proyecto
 * @property {number} min_emp - Cantidad mínima de empleados requerida
 * @property {number} max_emp - Cantidad máxima de empleados permitida
 * @property {string} ubicacion - Dirección o geolocalización de la faena
 * @property {number} [latitud] - Latitud numérica real, usada para validar geolocalización de asistencia
 * @property {number} [longitud] - Longitud numérica real, usada para validar geolocalización de asistencia
 * @property {number} [radio_geocerca] - Radio permitido en metros para marcar asistencia (default 200)
 * @property {string} fecha_inicio - Fecha de inicio programada (ISO string)
 * @property {string} fecha_termino - Fecha de término estimada (ISO string)
 * @property {('EN_PREPARACION'|'EN_CURSO'|'FINALIZADO')} estado - Estado operativo del proyecto
 * @property {boolean} activo - Estado lógico para borrado suave (soft delete)
 */

import { AppDataSource } from '../../config/ConfigDB.js';
import { In } from 'typeorm';

const proyectoRepository = AppDataSource.getRepository('Proyecto');
const usuarioProyectoRepository = AppDataSource.getRepository('ProyectoUsuario');

/**
 * 1. Crear Proyecto
 */
export const crearProyecto = async (data, ejecutor) => {
    try {
        if (!['ROOT', 'ADMIN'].includes(ejecutor.rol)) {
            throw new Error("solo administradores pueden crear proyectos");
        }

        const nuevoProyecto = proyectoRepository.create({
            nombre_proy: data.nombre,
            min_emp: data.min_emp,
            max_emp: data.max_emp,
            ubicacion: data.ubicacion,
            latitud: data.latitud ?? null,
            longitud: data.longitud ?? null,
            radio_geocerca: data.radio_geocerca ?? null,
            fecha_inicio: data.fecha_inicio,
            fecha_termino: data.fecha_termino,
            estado: data.estado || "EN_PREPARACION",
            activo: true
        });

        const guardado = await proyectoRepository.save(nuevoProyecto);
        return [guardado, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * 2. Obtener todos los proyectos del sistema (con personal enriquecido)
 */
export const obtenerTodosProyectos = async () => {
    try {
        const proyectos = await proyectoRepository.find({
            where: { activo: true },
            order: { id_proyecto: 'ASC' }
        });
        const enriquecidos = await enriquecerProyectosConPersonal(proyectos);
        return [enriquecidos, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * 3. Obtener proyectos según rol (ADMIN ve todo, otros ven solo su asignación)
 */
export const obtenerProyectosPorUsuario = async (usuario) => {
    try {
        if (['ROOT', 'ADMIN'].includes(usuario.rol)) {
            return await obtenerTodosProyectos();
        }

        const misProyectos = await usuarioProyectoRepository.find({
            where: { id_usuario: usuario.id_usuario || usuario.id, activo: true }
        });

        if (misProyectos.length === 0) {
            return [[], null];
        }

        const misIds = misProyectos.map(p => p.id_proyecto);

        const proyectos = await proyectoRepository.find({
            where: { id_proyecto: In(misIds), activo: true },
            order: { id_proyecto: 'ASC' }
        });

        const enriquecidos = await enriquecerProyectosConPersonal(proyectos);
        return [enriquecidos, null];
    } catch (error) {
        console.error("❌ ERROR EN obtenerProyectosPorUsuario");
        console.error(error);
        return [null, error.message];
    }
};

/**
 * 4. Obtener un proyecto específico validando accesos
 */
export const obtenerProyectosPorId = async (id, usuario) => {
    try {
        const proyecto = await proyectoRepository.findOne({
            where: { id_proyecto: parseInt(id), activo: true }
        });

        if (!proyecto) throw new Error('proyecto no encontrado');

        if (!['ROOT', 'ADMIN'].includes(usuario.rol)) {
            const pertenece = await usuarioProyectoRepository.findOne({
                where: { id_proyecto: parseInt(id), id_usuario: usuario.id_usuario || usuario.id, activo: true }
            });
            if (!pertenece) throw new Error('no tienes acceso a este proyecto');
        }
        
        return [proyecto, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * 5. Editar Proyecto (Admin/Root)
 */
export const editarProyecto = async (id_proyecto, data, ejecutor) => {
    try {
        if (!['ROOT', 'ADMIN'].includes(ejecutor.rol)) {
            throw new Error("solo administradores pueden editar proyectos");
        }

        const proyecto = await proyectoRepository.findOne({
            where: { id_proyecto: parseInt(id_proyecto) }
        });

        if (!proyecto) throw new Error('proyecto no encontrado');

        if (data.nombre !== undefined) {
            proyecto.nombre_proy = data.nombre;
        }

        Object.assign(proyecto, {
            min_emp: data.min_emp,
            max_emp: data.max_emp,
            ubicacion: data.ubicacion,
            latitud: data.latitud ?? proyecto.latitud,
            longitud: data.longitud ?? proyecto.longitud,
            radio_geocerca: data.radio_geocerca ?? proyecto.radio_geocerca,
            fecha_inicio: data.fecha_inicio,
            fecha_termino: data.fecha_termino,
            estado: data.estado
        });

        const actualizado = await proyectoRepository.save(proyecto);
        return [actualizado, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * 6. Borrado lógico de Proyecto
 */
export const eliminarProyecto = async (id, ejecutor) => {
    try {
        if (!['ROOT', 'ADMIN'].includes(ejecutor.rol)) {
            throw new Error("solo administradores pueden eliminar proyectos");
        }

        const proyecto = await proyectoRepository.findOne({
            where: { id_proyecto: parseInt(id) }
        });

        if (!proyecto) throw new Error('proyecto no encontrado');

        proyecto.activo = false;
        await proyectoRepository.save(proyecto);

        return [{ message: 'proyecto eliminado de forma exitosa' }, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * Enriquece una lista de proyectos con:
 * - cantidad_empleados: conteo real de vínculos activos con Usuario.rol === 'EMPLEADO'
 * - supervisores: lista de supervisores activos del proyecto, cada uno con
 *   proyectos_asignados (conteo GLOBAL de proyectos activos en los que participa,
 *   no solo dentro de este listado)
 */
const enriquecerProyectosConPersonal = async (proyectos) => {
    if (proyectos.length === 0) return proyectos;

    const ids = proyectos.map((p) => p.id_proyecto);

    const vinculos = await usuarioProyectoRepository
        .createQueryBuilder("pu")
        .innerJoin("Usuario", "u", "u.id_usuario = pu.id_usuario")
        .select([
            "pu.id_proyecto AS id_proyecto",
            "u.id_usuario AS id_usuario",
            "u.nombre AS nombre",
            "u.apellido AS apellido",
            "u.rol AS rol",
        ])
        .where("pu.id_proyecto IN (:...ids)", { ids })
        .andWhere("pu.activo = true")
        .getRawMany();

    const empleadosPorProyecto    = new Map();
    const supervisoresPorProyecto = new Map();
    const idsSupervisores         = new Set();

    for (const v of vinculos) {
        if (v.rol === "EMPLEADO") {
            empleadosPorProyecto.set(v.id_proyecto, (empleadosPorProyecto.get(v.id_proyecto) ?? 0) + 1);
        }
        if (v.rol === "SUPERVISOR") {
            const lista = supervisoresPorProyecto.get(v.id_proyecto) ?? [];
            lista.push({ id_usuario: v.id_usuario, nombre: v.nombre, apellido: v.apellido });
            supervisoresPorProyecto.set(v.id_proyecto, lista);
            idsSupervisores.add(v.id_usuario);
        }
    }

    let totalesPorSupervisor = new Map();
    if (idsSupervisores.size > 0) {
        const totales = await usuarioProyectoRepository
            .createQueryBuilder("pu")
            .select("pu.id_usuario", "id_usuario")
            .addSelect("COUNT(DISTINCT pu.id_proyecto)", "total")
            .where("pu.id_usuario IN (:...ids)", { ids: [...idsSupervisores] })
            .andWhere("pu.activo = true")
            .groupBy("pu.id_usuario")
            .getRawMany();

        totalesPorSupervisor = new Map(totales.map((t) => [Number(t.id_usuario), Number(t.total)]));
    }

    return proyectos.map((p) => ({
        ...p,
        cantidad_empleados: empleadosPorProyecto.get(p.id_proyecto) ?? 0,
        supervisores: (supervisoresPorProyecto.get(p.id_proyecto) ?? []).map((s) => ({
            ...s,
            proyectos_asignados: totalesPorSupervisor.get(s.id_usuario) ?? 0,
        })),
    }));
};
