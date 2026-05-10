import * as UsuarioService from './usuario.service.js';
import * as PowerService from './power.service.js';

// Helper para respuestas uniformes
const sendResponse = (res, status, payload) => {
    const isError = status >= 400;
    return res.status(status).json({ [isError ? 'error' : 'data']: payload });
};

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
        const nuevoUsuario = await UsuarioService.crearUsuario(req.body, req.user);
        
        return sendResponse(res, 201, {
            message: "Usuario creado exitosamente",
            usuario: nuevoUsuario
        });
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// ################# ACTUALIZACIÓN (EDITAR) #################

/**
 * Actualiza datos básicos y/o poderes.
 * Aplica lógica de ancestros para ADMINS y jerarquía para el resto.
 */
export const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        // El service se encarga de verificar si req.user es ancestro o tiene permiso
        const actualizado = await UsuarioService.actualizar(id, req.body, req.user);
        
        return sendResponse(res, 200, {
            message: "Usuario actualizado correctamente",
            data: actualizado
        });
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// ################# ELIMINACIÓN #################

/**
 * Desactivación de usuario (Soft Delete)
 * Revoca poderes, cambia rol a SIN_ASIGNAR y estado activo a false.
 */
export const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Aplica lógica: ADMIN (solo ancestros), OTROS (cualquier admin con poder)
        const resultado = await UsuarioService.eliminar(id, req.user);
        
        return sendResponse(res, 200, resultado);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// ################# GESTIÓN DE PODERES (ESPECÍFICO) #################

/**
 * Permite a un Admin ver los poderes que él mismo posee para poder asignar.
 * Útil para renderizar el checklist de "Powers menores o iguales"
 */
export const obtenerMisPoderesPropios = async (req, res) => {
    try {
        const poderes = await PowerService.obtenerPoderesDeUsuario(req.user.id);
        // Retornamos solo los IDs para el checklist
        const listaIds = poderes.map(p => p.id_power);
        return sendResponse(res, 200, listaIds);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

/**
 * Endpoint para obtener el diccionario maestro de poderes (Solo lectura)
 */
export const obtenerCatalogoPoderes = async (req, res) => {
    try {
        const catalogo = await PowerService.obtenerCatalogo();
        return sendResponse(res, 200, catalogo);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};