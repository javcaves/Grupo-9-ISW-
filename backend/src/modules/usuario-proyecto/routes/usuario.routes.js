import { Router } from 'express';
import * as UsuarioController from './usuario.controller.js';
import { validarUsuario } from '../entity/usuario.schema.js';

const router = Router();

/**
 * Gestión de Usuarios
 * Prefijo sugerido desde el router principal: /usuarios
 */

// --- BÚSQUEDA Y LISTADO ---
// Soporta queries: ?nombre=...&cargo=...&poder=...&rut=...
router.get('/', UsuarioController.buscarUsuarios);
router.get('/:id', UsuarioController.obtenerUsuarioPorId);

// --- REGISTRO ---
router.post('/', validarUsuario, UsuarioController.registrarUsuario);

// --- ACTUALIZACIÓN ---
router.put('/:id', validarUsuario, UsuarioController.actualizarUsuario);

// --- ELIMINACIÓN (Soft Delete) ---
router.delete('/:id', UsuarioController.eliminarUsuario);

// --- UTILIDADES DE PERMISOS (Para el Administrador) ---
// Obtiene el diccionario maestro de powers.json
router.get('/config/catalogo-powers', UsuarioController.obtenerCatalogoPoderes);
// Obtiene solo los IDs de poderes que el usuario logueado puede asignar a otros
router.get('/config/mis-poderes', UsuarioController.obtenerMisPoderesPropios);

export default router;