import { Router } from 'express';
import * as ActividadesCtrl from './actividades.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();

const rolesPermitidos = ["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO"];

// ----- Rutas de lectura ------
router.get('/', authenticateJwt, ActividadesCtrl.listarCatalogo); // Catálogo completo
router.get('/buscar', authenticateJwt, ActividadesCtrl.buscarActividades); // Busca por nombre de tarea
router.get('/:id', authenticateJwt, ActividadesCtrl.obtenerActividad); // Obtener por ID

// ----- Rutas de escritura -----
router.post('/registrar', authenticateJwt, checkRole(rolesPermitidos), ActividadesCtrl.registrarEnCatalogo); // Registrar nueva tarea
router.put('/:id', authenticateJwt, checkRole(rolesPermitidos), ActividadesCtrl.actualizarActividadController); // Actualizar nombre o categoría

// ----- Rutas de eliminacion -----
router.delete('/:id', authenticateJwt, checkRole(rolesPermitidos), ActividadesCtrl.eliminarDelCatalogo); // Soft Delete (Desactivar del catálogo)

export default router;