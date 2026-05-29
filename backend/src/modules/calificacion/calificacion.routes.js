import { Router } from 'express';
import * as CalificacionCtrl from './calificacion.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();
const rolesPermitidos = ["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO"];

router.get('/', authenticateJwt, checkRole(rolesPermitidos), CalificacionCtrl.listarCalificaciones);
router.get('/categoria/:id_cat', authenticateJwt, checkRole(rolesPermitidos), CalificacionCtrl.listarPorCategoria);
router.get('/:id', authenticateJwt, checkRole(rolesPermitidos), CalificacionCtrl.obtenerCalificacion);
router.post('/', authenticateJwt, checkRole(rolesPermitidos), CalificacionCtrl.otorgar);
router.delete('/:id', authenticateJwt, checkRole(rolesPermitidos), CalificacionCtrl.revocar);

export default router;