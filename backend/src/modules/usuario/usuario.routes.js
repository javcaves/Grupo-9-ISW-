import { Router } from 'express';
import * as UsuarioController from './usuario.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
//AGREGAR CHECKROLE EN MIDDLEWARE
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();

/**
 * Gestión de Usuarios
 * Prefijo sugerido desde el router principal: /usuarios
 */

// --- REGISTRO ---
router.post('/', UsuarioController.registrarUsuario);

// --- BÚSQUEDA Y LISTADO ---
// Soporta queries: ?nombre=...&rol=...&poder=...&rut=...
router.get('/', authenticateJwt, UsuarioController.buscarUsuarios);
router.get('/:id_usuario', authenticateJwt, UsuarioController.obtenerUsuarioPorId);

// --- ACTUALIZACIÓN ---
router.put('/:id_usuario', authenticateJwt, UsuarioController.actualizarUsuario);

// --- ELIMINACIÓN (Soft Delete) ---
router.delete('/:id_usuario', authenticateJwt, checkRole(['ROOT', 'ADMIN']), UsuarioController.eliminarUsuario);

export default router;