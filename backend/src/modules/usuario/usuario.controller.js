import * as UsuarioService from './usuario.service.js';
import * as PowerService from '../power/power.service.js';

import{
    usuarioQueryValidation,
    usuarioCreateValidation,
    usuarioUpdateValidation,
    usuarioIdValidation
} from './usuario.validations.js';

//importar handlers (no existen estos archivos aun)
import * as responseHandlers from "../../handlers/responseHandlers.js";


// ################# LISTAR Y BUSCAR #################

/**
 * Obtener usuarios con filtros dinámicos (ID, RUT, Nombre, Cargo, Poder)
 * Cumple con requerimiento de visualización para Admins y Supervisores
 */
export const buscarUsuarios = async (req, res) => {
    try {
        // req.query puede contener: id, rut, nombre, cargo, poder, activo
        const resultados = await UsuarioService.buscar(req.query);
        return sendResponse(res, 200, resultados);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

/**
 * Obtener un único usuario por ID detallando sus poderes actuales
 */
export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await UsuarioService.obtenerPorId(id);
        if (!usuario) return sendResponse(res, 404, "Usuario no encontrado");

        // Adjuntamos los poderes activos para la vista de edición
        const poderes = await PowerService.obtenerPoderesDeUsuario(id);
        return sendResponse(res, 200, { ...usuario, powers: poderes });
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

// ################# REGISTRO (CREAR) #################

/**
 * Registro general de usuarios (Admin, Supervisor, Encargado, Empleado)
 * Valida jerarquía y asignación de poderes iniciales
 */
export const registrarUsuario = async (req, res) => {
    try {
        // req.user viene del middleware de autenticación { id, cargo, ... }
        // req.body debe cumplir con usuario.schema.js

        const { error, value } = usuarioCreateValidation.validate(req.body);
        if (error){
            return handleErrorClient(res, 400, 'error de validacion', error.message);
        }

        const [nuevoUsuario, err] = await UsuarioService.crearUsuario(value, req.user);
        if (err) return handleErrorClient(res, 400, 'error de validacion', error.message);

        //asignaiicon de poderes por si vienne en la creacion
        if(value.powers && value.powers.length > 0){
            await PowerService.asignarPoderes(nuevoUsuario.id, value.powers, req.user);
        }

        return handleSuccess(res, 201, 'usuario creado de forma exitosa', nuevoUsuario);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor, error.message');
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

        if(idError) return handleErrorClient(res, 400, 'error, id invalido', error.message);

        const { error, value } = usuarioUpdateValidation.validate(req.body);

        if (error){
            return handleErrorClient(res, 400, 'error de validacion', error.message);
        }

        //si hay poderes se actualizan
        if(value.powers && value.powers.length > 0){
            await PowerService.asignarPoderes(idValue.id, value, req.user);
            delete value.powers;
        }

        const [actualizado, err] = await UsuarioService.actualizarUsuario(idValue.id, value, req.user);
        if (err) return handleErrorClient(res, 400, 'error de validacion', error.message);
        
        return handleSuccess(res, 200, 'usuario actualizado de forma exitosa', actualizado);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor, error.message');
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
            return handleErrorClient(res, 400, 'error de validacion', error.message);
        }

        const [resultado, err] = await UsuarioService.eliminarUsuario(value.id, req.user);
        if (err) return handleErrorClient(res, 403, 'error al eliminar', error.message);

        await PowerService.revocarPoderesPorEliminacion(value.id);

        return handleSuccess(res, 200, 'usuario eliminado de forma exitosa', actualizado);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor, error.message');
    }
};
