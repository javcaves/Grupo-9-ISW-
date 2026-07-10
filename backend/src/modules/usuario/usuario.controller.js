import * as UsuarioService from './usuario.service.js';

import {
    usuarioQuerySearchValidation,
    usuarioCreateValidation,
    usuarioUpdateValidation,
    usuarioIdValidation
} from './usuario.validations.js';

import { handleSuccess, handleErrorClient, handleErrorServer } from '../../handlers/responseHandlers.js';


// ################# LISTAR Y BUSCAR #################

/**
 * Obtener usuarios con filtros dinámicos (ID, RUT, Nombre, Rol)
 * Cumple con requerimiento de visualización para Admins y Supervisores
 */
export const buscarUsuarios = async (req, res) => {
    try {
        const { error, value } = usuarioQuerySearchValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, 'error de validacion', error.message);

        const [resultados, err] = await UsuarioService.obtenerTodosActivos(value);
        if (err) return handleErrorClient(res, 400, "Error al buscar usuarios", err);
        return handleSuccess(res, 200, 'usuarios obtenidos de forma exitosa', resultados);
    } catch (error) {
        return handleErrorServer(res, 500, "Error en el servidor", error.message);
    }
};

/**
 * Obtener un único usuario por ID
 */
export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const [usuario, err] = await UsuarioService.obtenerUsuarioPorID(id_usuario);
        if (err || !usuario) return handleErrorClient(res, 404, "Usuario no encontrado");

        return handleSuccess(res, 200, 'usuario obtenido de forma exitosa', usuario);
    } catch (error) {
        return handleErrorServer(res, 500, "Error en el servidor", error.message);
    }
};

// ################# REGISTRO (CREAR) #################

/**
 * Registro general de usuarios (Admin, Supervisor, Encargado, Empleado)
 * Valida jerarquía
 */
export const registrarUsuario = async (req, res) => {
    try {
        const { error, value } = usuarioCreateValidation.validate(req.body);
        if (error){
            return handleErrorClient(res, 400, 'error de validacion', error.message);
        }

        const [nuevoUsuario, err] = await UsuarioService.crearUsuario(value, req.user);
        if (err) return handleErrorClient(res, 400, 'error de validacion', err);

        return handleSuccess(res, 201, 'usuario creado de forma exitosa', nuevoUsuario);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

// ################# ACTUALIZACIÓN (EDITAR) #################

/**
 * Actualiza datos básicos.
 * Aplica lógica de ancestros para ADMINS y jerarquía para el resto.
 */
export const actualizarUsuario = async (req, res) => {
    try {
        const {
            error: idError,
            value: idValue
        } = usuarioIdValidation.validate(req.params);

        if(idError) return handleErrorClient(res, 400, 'error, id invalido', idError.message);

        const { error, value } = usuarioUpdateValidation.validate(req.body);

        if (error){
            return handleErrorClient(res, 400, 'error de validacion', error.message);
        }

        const [actualizado, err] = await UsuarioService.actualizarUsuario(idValue.id_usuario, value, req.user);
        if (err) return handleErrorClient(res, 400, 'error de validacion', err);
        
        return handleSuccess(res, 200, 'usuario actualizado de forma exitosa', actualizado);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

// ################# ELIMINACIÓN #################

/**
 * Desactivación de usuario (Soft Delete)
 * Cambia rol a SIN_ASIGNAR y estado activo a false.
 */
export const eliminarUsuario = async (req, res) => {
    try {
        const { error, value } = usuarioIdValidation.validate(req.params);
        if (error){
            return handleErrorClient(res, 400, 'error de validacion', error.message);
        }

        const [resultado, err] = await UsuarioService.eliminarUsuarioService(value.id_usuario, req.user);
        if (err) return handleErrorClient(res, 403, 'error al eliminar', err);

        return handleSuccess(res, 200, 'usuario eliminado de forma exitosa', resultado);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

// Cambio de contraseña por el propio usuario autenticado
export const cambiarMiPassword = async (req, res) => {
    try {
        const id_usuario = req.user?.id_usuario;
        const { passwordActual, passwordNueva } = req.body;

        if (!passwordActual || typeof passwordActual !== "string") {
            return handleErrorClient(res, 400, "error de validacion", "Debes ingresar tu contraseña actual.");
        }
        if (!passwordNueva || typeof passwordNueva !== "string" || passwordNueva.length < 6) {
            return handleErrorClient(res, 400, "error de validacion", "La nueva contraseña debe tener al menos 6 caracteres.");
        }

        const [resultado, err] = await UsuarioService.cambiarMiPassword(id_usuario, passwordActual, passwordNueva);
        if (err) return handleErrorClient(res, 400, "no se pudo actualizar la contraseña", err);

        return handleSuccess(res, 200, resultado.message, null);
    } catch (error) {
        return handleErrorServer(res, 500, "error de servidor", error.message);
    }
};

export const resetearPassword = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const { password } = req.body;

        if (!password || typeof password !== "string" || password.length < 6) {
            return handleErrorClient(res, 400, "error de validacion", "La nueva contraseña debe tener al menos 6 caracteres.");
        }

        const [resultado, err] = await UsuarioService.resetearPasswordUsuario(id_usuario, password);
        if (err) return handleErrorClient(res, 400, "no se pudo actualizar la contraseña", err);

        return handleSuccess(res, 200, resultado.message, null);
    } catch (error) {
        return handleErrorServer(res, 500, "error de servidor", error.message);
    }
};