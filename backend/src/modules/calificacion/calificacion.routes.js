import { Router } from 'express';
import * as CalificacionCtrl from '../controllers/calificacion.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';

const router = Router();
const rolesPermitidos = ["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO"];

router.get('/', authenticateJwt, CalificacionCtrl.listarCalificaciones);
router.get('/:id', authenticateJwt, CalificacionCtrl.obtenerCalificacion);
router.post('/', authenticateJwt, checkRole(rolesPermitidos), CalificacionCtrl.otorgar);
router.delete('/:id', authenticateJwt, checkRole(rolesPermitidos), CalificacionCtrl.revocar);

export default router;