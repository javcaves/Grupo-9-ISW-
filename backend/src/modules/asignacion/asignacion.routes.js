import { Router } from 'express';
import * as AsignacionCtrl from './asignacion.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();
const rolesPermitidos = ["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO"];

router.get('/', authenticateJwt, AsignacionCtrl.listarAsignaciones);
router.get('/:id', authenticateJwt, AsignacionCtrl.obtenerAsignacion);
router.post('/', authenticateJwt, checkRole(rolesPermitidos), AsignacionCtrl.crearAsignacion);
router.put('/:id', authenticateJwt, checkRole(rolesPermitidos), AsignacionCtrl.actualizarAsignacion);
router.delete('/:id', authenticateJwt, checkRole(rolesPermitidos), AsignacionCtrl.eliminarAsignacion);

export default router;