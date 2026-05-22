/**
 * @typedef {Object} Proyecto
 * @property {number} id_proyecto - Identificador único autoincremental
 * @property {string} nombre_proy - Nombre descriptivo del proyecto
 * @property {number} min_emp - Cantidad mínima de empleados requerida
 * @property {number} max_emp - Cantidad máxima de empleados permitida
 * @property {string} ubicacion - Dirección o geolocalización de la faena
 * @property {string} fecha_inicio - Fecha de inicio programada (ISO string)
 * @property {string} fecha_termino - Fecha de término estimada (ISO string)
 * @property {('EN_PREPARACION'|'EN_CURSO'|'FINALIZADO')} estado - Estado operativo del proyecto
 * @property {boolean} activo - Estado lógico para borrado suave (soft delete)
 */

/**
 * @typedef {Object} ProyectoUsuario
 * @property {number} id_proyecto - Referencia al ID del proyecto
 * @property {number} id_usuario - Referencia al ID del usuario (Encargado, Supervisor, Empleado)
 * @property {string} fecha_asignacion - Fecha en que se vinculó al proyecto (ISO string)
 * @property {string|null} fecha_termino - Fecha de desvinculación o finalización (ISO string o null)
 * @property {boolean} activo - Define si la vinculación está vigente actualmente
 */

import { AppDataSource } from '../../config/ConfigDB.js';
import { In } from 'typeorm';
/**
 * Valida si un empleado ya está en otro proyecto activo
 */

const proyectoRepository = AppDataSource.getRepository('Proyecto');
const usuarioProyectoRepository = AppDataSource.getRepository('UsuarioProyecto');


// --- MÉTODOS ---

// src/modules/proyecto/proyecto.service.js

/**
 * 1. Crear Proyecto
 */
export const crearProyecto = async (data, ejecutor) => {
    try {
        if (!['ROOT', 'ADMIN'].includes(ejecutor.rol)) {
            throw new Error("solo administradores pueden crear proyectos");
        }

        const nuevoProyecto = proyectoRepository.create({
            nombre_proy: data.nombre, // 🌟 Mapeo correcto para POST
            min_emp: data.min_emp,
            max_emp: data.max_emp,
            ubicacion: data.ubicacion,
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
 * 2. Obtener todos los proyectos del sistema
 */
export const obtenerTodosProyectos = async () => {
    try {
        const proyectos = await proyectoRepository.find({
            where: { activo: true },
            order: { id_proyecto: 'ASC' }
        });
        return [proyectos, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * 3. Obtener proyectos según rol (ADMIN ve todo, otros ven solo su asignación)
 */
export const obtenerProyectosPorUsuario = async (usuario) => { // 🌟 CORREGIDO: Ahora recibe 'usuario'
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

        return [proyectos, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * 4. Obtener un proyecto específico validando accesos
 */
export const obtenerProyectosPorId = async (id, usuario) => {
    try {
        // 🌟 CORREGIDO: Se cambió 'find' por 'findOne' para manejar el objeto directo
        const proyecto = await proyectoRepository.findOne({
            where: { id_proyecto: parseInt(id), activo: true }
        });

        if (!proyecto) throw new Error('proyecto no encontrado');

        // 🌟 CORREGIDO: Sintaxis correcta de negación lógica
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

        // 🌟 CORREGIDO PARA EL PUT: 
        // Si desde el JSON viene 'nombre', lo asignamos manualmente a 'nombre_proy' antes de guardar
        if (data.nombre !== undefined) {
            proyecto.nombre_proy = data.nombre;
        }

        // El resto de los campos planos se pueden asignar con normalidad
        Object.assign(proyecto, {
            min_emp: data.min_emp,
            max_emp: data.max_emp,
            ubicacion: data.ubicacion,
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

        // 🌟 CORREGIDO: Cambiado de find a findOne
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