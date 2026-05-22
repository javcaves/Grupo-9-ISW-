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
/**
 * Valida si un empleado ya está en otro proyecto activo
 */

const proyectoRepository = AppDataSource.getRepository('Proyecto');
const usuarioProyectoRepository = AppDataSource.getRepository('UsuarioProyecto');


// --- MÉTODOS ---

/**
 * Crear Proyecto (Solo ADMIN/ROOT)
 */
export const crearProyecto = async (data, ejecutor) => {
    try{
        if (!['ROOT', 'ADMIN'].includes(ejecutor.rol)) {
            throw new Error("solo administradores pueden crear proyectos");
        }

        const nuevoProyecto = proyectoRepository.create({
            nombre: data.nombre,
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
    }catch(error){
        return[null, error.message];
    }
};


const obtenerTodosProyectos = async() =>{
    try{
        const proyectos = await proyectoRepository.find({
            order: {id_proyecto: 'ASC'}
        });

        return[proyectos, null];
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    } 
};
/**
 * Obtener proyectos según rol
 * Si es ADMIN ve todos. Si es ENCARGADO/SUPERVISOR solo los suyos.
 */
export const obtenerProyectosPorUsuario = async() =>{
    try{
        if (['ROOT', 'ADMIN'].includes(usuario.rol)) {
            return await obtenerTodosProyectos();
        }

        const misProyectos = await usuarioProyectoRepository.find({
            where:{id_usuario: usuario.id, activo: true}
        });

        const misIds = misProyectos.map(p =>
            p.id_proyecto
        );

        const proyectos = await proyectoRepository.find({
            where: {id_proyecto: In(misIds), activo: true},
            order: {id_proyecto: 'ASC'}
        })

        return[proyectos, null];
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

export const obtenerProyectosPorId = async(id, usuario) =>{
    try{
        const proyecto = await proyectoRepository.find({
            where: {id_proyecto: parseInt(id)}
        });

        if(!proyecto) throw new Error('proyecto no econtrado');

        if ([!'ROOT', 'ADMIN'].includes(usuario.rol)) {
            const pertenece = await usuarioProyectoRepository.findOne({
                where: {id_proyecto: parseInt(id), id_usuario: usuario.id, activo: true}
            });
            if(!pertenece) throw new Error('no tienes acceso a este proyecto');
        };
        
        return[proyecto, null];
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

/**
 * Editar Proyecto (Admin)
 */
export const editarProyecto = async (id_proyecto, data, ejecutor) => {
    try{
        if (!['ROOT', 'ADMIN'].includes(ejecutor.rol)) {
        throw new Error("solo administradores pueden crear proyectos");
        };

        const proyecto = await proyectoRepository.find({
            where: {id_proyecto: parseInt(id)}
        });

        if(!proyecto) throw new Error('proyecto no econtrado');

        Object.assign(proyecto, data);

        const actualizado = await proyectoRepository.save(proyecto);
        return[actualizado, null];

    }catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

export const eliminarProyecto = async(id, ejecutor) =>{
    try{
        if (!['ROOT', 'ADMIN'].includes(ejecutor.rol)) {
            throw new Error("solo administradores pueden crear proyectos");
        };

        const proyecto = await proyectoRepository.find({
            where: {id_proyecto: parseInt(id)}
        });

        if(!proyecto) throw new Error('proyecto no econtrado');

        proyecto.activo = false;
        await proyectoRepository.save(proyecto);

        return[{message:'proyecto eliminado de forma exitosa'}, null];

    }catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};