import { Router } from 'express';
import * as TareaCtrl from './tarea.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();
const rolesPermitidos = ["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO"];

router.get('/', authenticateJwt, TareaCtrl.listarTareas);
router.get("/mis-tareas",authenticateJwt,TareaCtrl.obtenerMisTareas);
router.get('/:id', authenticateJwt, TareaCtrl.obtenerTarea);
router.post('/', authenticateJwt, checkRole(rolesPermitidos), TareaCtrl.programar);
router.put('/:id', authenticateJwt, checkRole(rolesPermitidos), TareaCtrl.actualizar);
router.delete('/:id', authenticateJwt, checkRole(rolesPermitidos), TareaCtrl.eliminar);
router.patch('/:id/cancelar', authenticateJwt, checkRole(rolesPermitidos), TareaCtrl.cancelar);
router.patch('/:id/completar', authenticateJwt, TareaCtrl.completar);


export default router;