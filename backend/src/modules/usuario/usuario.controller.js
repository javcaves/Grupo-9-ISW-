import * as UsuarioService from './usuario.service.js';
import * as PowerService from '../power/power.service.js';

import{
    usuarioQueryValidation,
    usuarioCreateValidation,
    usuarioUpdateValidation,
    usuarioIdValidation
} from './usuario.validations.js';

import * as responseHandlers from "../../handlers/responseHandlers.js";


// ################# LISTAR Y BUSCAR #################

/**
 * Obtener usuarios con filtros dinámicos (ID, RUT, Nombre, Rol, Poder)
 * Cumple con requerimiento de visualización para Admins y Supervisores
 */
export const buscarUsuarios = async (req, res) => {
    try {
        const [resultados, err] = await UsuarioService.obtenerTodosActivos();
        if (err) return responseHandlers.handleErrorClient(res, 400, "Error al buscar usuarios", err);
        return res.status(200).json(resultados);
    } catch (error) {
        return responseHandlers.handleErrorServer(res, 500, "Error en el servidor", error.message);
    }
};

/**
 * Obtener un único usuario por ID detallando sus poderes actuales
 */
export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [usuario, err] = await UsuarioService.obtenerUsuarioPorID(id);
        if (err || !usuario) return responseHandlers.handleErrorClient(res, 404, "Usuario no encontrado");

        const poderes = await PowerService.obtenerPoderesDeUsuario(id);
        return res.status(200).json({ ...usuario, powers: poderes });
    } catch (error) {
        return responseHandlers.handleErrorServer(res, 500, "Error en el servidor", error.message);
    }
};

// ################# REGISTRO (CREAR) #################

/**
 * Registro general de usuarios (Admin, Supervisor, Encargado, Empleado)
 * Valida jerarquía y asignación de poderes iniciales
 */
export const registrarUsuario = async (req, res) => {
    try {
        const { error, value } = usuarioCreateValidation.validate(req.body);
        if (error){
            return responseHandlers.handleErrorClient(res, 400, 'error de validacion', error.message);
        }

        const [nuevoUsuario, err] = await UsuarioService.crearUsuario(value, req.user);
        if (err) return responseHandlers.handleErrorClient(res, 400, 'error de validacion', err);

        if(value.powers && value.powers.length > 0){
            await PowerService.asignarPoderes(nuevoUsuario.id, value.powers, req.user);
        }

        return responseHandlers.handleSuccess(res, 201, 'usuario creado de forma exitosa', nuevoUsuario);
    } catch (error) {
        return responseHandlers.handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

// ################# ACTUALIZACIÓN (EDITAR) #################

/**
 * Actualiza datos básicos y/o poderes.
 * Aplica lógica de ancestros para ADMINS y jerarquía para el resto.
 */
export const actualizarUsuario = async (req, res) => {
    try {
        const {
            error: idError,
            value: idValue
        } = usuarioIdValidation.validate(req.params);

        if(idError) return responseHandlers.handleErrorClient(res, 400, 'error, id invalido', idError.message);

        const { error, value } = usuarioUpdateValidation.validate(req.body);

        if (error){
            return responseHandlers.handleErrorClient(res, 400, 'error de validacion', error.message);
        }

        if(value.powers && value.powers.length > 0){
            await PowerService.asignarPoderes(idValue.id, value, req.user);
            delete value.powers;
        }

        const [actualizado, err] = await UsuarioService.actualizarUsuario(idValue.id, value, req.user);
        if (err) return responseHandlers.handleErrorClient(res, 400, 'error de validacion', err);
        
        return responseHandlers.handleSuccess(res, 200, 'usuario actualizado de forma exitosa', actualizado);
    } catch (error) {
        return responseHandlers.handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

// ################# ELIMINACIÓN #################

/**
 * Desactivación de usuario (Soft Delete)
 * Revoca poderes, cambia rol a SIN_ASIGNAR y estado activo a false.
 */
export const eliminarUsuario = async (req, res) => {
    try {
        const { error, value } = usuarioIdValidation.validate(req.params);
        if (error){
            return responseHandlers.handleErrorClient(res, 400, 'error de validacion', error.message);
        }

        const [resultado, err] = await UsuarioService.eliminarUsuarioService(value.id, req.user);
        if (err) return responseHandlers.handleErrorClient(res, 403, 'error al eliminar', err);

        await PowerService.revocarPoderesPorEliminacion(value.id);

        return responseHandlers.handleSuccess(res, 200, 'usuario eliminado de forma exitosa', resultado);
    } catch (error) {
        return responseHandlers.handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};