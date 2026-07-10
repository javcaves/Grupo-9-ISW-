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

// --- REGISTRO PROTEGIDO ---
router.post('/', authenticateJwt, checkRole(['ROOT', 'ADMIN']), UsuarioController.registrarUsuario);

// --- BÚSQUEDA Y LISTADO ---
// Soporta queries: ?nombre=...&rol=...&poder=...&rut=...
router.get('/', authenticateJwt, UsuarioController.buscarUsuarios);
router.get('/:id_usuario', authenticateJwt, UsuarioController.obtenerUsuarioPorId);

// --- ACTUALIZACIÓN ---
// Cambio de la propia contraseña (cualquier usuario autenticado, sobre sí mismo)
router.put('/me/password', authenticateJwt, UsuarioController.cambiarMiPassword);

router.put('/:id_usuario', authenticateJwt, UsuarioController.actualizarUsuario);

// --- ELIMINACIÓN (Soft Delete) ---
router.delete('/:id_usuario', authenticateJwt, checkRole(['ROOT', 'ADMIN']), UsuarioController.eliminarUsuario);

router.put('/:id_usuario/reset-password', authenticateJwt, checkRole(['ROOT', 'ADMIN', 'SUPERVISOR']), UsuarioController.resetearPassword);

export default router;