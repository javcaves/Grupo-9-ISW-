import { Router } from 'express';
import * as EvaluacionCtrl from './evaluacion.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();

const rolesPermitidos = ["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO"];

router.get('/empleado/:id_empleado', authenticateJwt, checkRole(rolesPermitidos), EvaluacionCtrl.listarPorEmpleado);
router.get('/tarea/:id_tarea', authenticateJwt, checkRole(rolesPermitidos), EvaluacionCtrl.listarPorTarea);
router.post('/', authenticateJwt, checkRole(rolesPermitidos), EvaluacionCtrl.crear);
router.patch('/:id/revocar', authenticateJwt, checkRole(rolesPermitidos), EvaluacionCtrl.revocar);

export default router;
