import * as ProyectoService from './proyecto.service.js';
import {
    proyectoCreateValidation,
    proyectoIdValidation,
    proyectoUpdateValidation
} from './proyecto.validations.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";

/**
 * 1. Crear nuevo proyecto (Solo Admin/Root)
 * POST /proyectos
 */
export const crearProyecto = async (req, res) => {
    try {
        const { error, value } = proyectoCreateValidation.validate(req.body);
        if (error){
            return handleErrorClient(res, 400, 'error de validacion', error.message);
        }

        // CORREGIDO: Se cambiaron las variables fantasmas por value y req.user
        const [nuevoProyecto, err] = await ProyectoService.crearProyecto(value, req.user);
        if (err) return handleErrorClient(res, 400, 'error al crear proyecto', err);

        return handleSuccess(res, 201, 'proyecto creado de forma exitosa', nuevoProyecto);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

export const obtenerTodosProyectos = async (req, res) => {
    try {
        if (!['ROOT', 'ADMIN'].includes(req.user.rol)) {
            return handleErrorClient(res, 403, 'acceso denegado', 'no tienes permiso');
        }

        const [proyectos, err] = await ProyectoService.obtenerTodosProyectos();
        if (err) return handleErrorClient(res, 500, 'error al obtener todos los proyectos', err);

        return handleSuccess(res, 200, 'proyectos obtenidos de forma exitosa', proyectos);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    } 
};

export const obtenerMisProyectos = async (req, res) => {
    try {
        const [proyectos, err] = await ProyectoService.obtenerProyectosPorUsuario(req.user);
        if (err) return handleErrorClient(res, 500, 'error al obtener proyectos', err);

        return handleSuccess(res, 200, 'proyectos obtenidos de forma exitosa', proyectos);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    } 
};

export const obtenerProyectosPorId = async (req, res) => {
    try {
        const { error, value } = proyectoIdValidation.validate(req.params);
        if (error){
            return handleErrorClient(res, 400, 'error de validacion', error.message);
        }
        const [proyecto, err] = await ProyectoService.obtenerProyectosPorId(value.id_proyecto, req.user);
        if (err) return handleErrorClient(res, 404, 'proyecto no encontrado', err);

        return handleSuccess(res, 200, 'proyecto obtenido de forma exitosa', proyecto);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

/**
 * 2. Editar proyecto (Solo Admin/Root)
 * PUT /proyectos/:id
 */
export const editarProyecto = async (req, res) => {
    try {
        const { error: idError, value: idValue } = proyectoIdValidation.validate(req.params);
        // CORREGIDO: Se cambió error.message por idError.message
        if (idError) return handleErrorClient(res, 400, 'error, id invalido', idError.message);
        
        const { error, value } = proyectoUpdateValidation.validate(req.body);
        if (error){
            return handleErrorClient(res, 400, 'error de validacion', error.message);
        }

        const [actualizado, err] = await ProyectoService.editarProyecto(idValue.id_proyecto, value, req.user);
        // CORREGIDO: Se cambió error.message por err
        if (err) return handleErrorClient(res, 400, 'error al editar proyecto', err);

        return handleSuccess(res, 200, 'proyecto actualizado de forma exitosa', actualizado);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

/**
 * 3. Eliminar proyecto (Solo Admin/Root)
 * DELETE /proyectos/:id
 */
// CORREGIDO: Se cambió la firma para que reciba (req, res) correspondientes a Express
export const eliminarProyecto = async (req, res) => {
    try {
        const { error, value } = proyectoIdValidation.validate(req.params);
        if (error){
            return handleErrorClient(res, 400, 'error de validacion', error.message);
        }
        const [resultado, err] = await ProyectoService.eliminarProyecto(value.id_proyecto, req.user);
        if (err) return handleErrorClient(res, 404, 'error al eliminar', err);

        // CORREGIDO: Se cambió la variable fantasma 'proyecto' por 'resultado'
        return handleSuccess(res, 200, 'proyecto eliminado de forma exitosa', resultado);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};