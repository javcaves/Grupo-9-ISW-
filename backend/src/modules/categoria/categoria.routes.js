import { Router } from 'express';
import * as CategoriaCtrl from './categoria.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();
const rolesPermitidos = ["ROOT", "ADMIN", "SUPERVISOR"]; 

router.get('/', authenticateJwt, checkRole(["ROOT", "ADMIN", "SUPERVISOR","ENCARGADO"]), CategoriaCtrl.listarCategorias);
router.get('/:id', authenticateJwt, checkRole(["ROOT", "ADMIN", "SUPERVISOR","ENCARGADO"]), CategoriaCtrl.obtenerCategoria);
router.post('/', authenticateJwt, checkRole(rolesPermitidos), CategoriaCtrl.registrarCategoria);
router.put('/:id', authenticateJwt, checkRole(rolesPermitidos), CategoriaCtrl.actualizarCategoria);
router.delete('/:id', authenticateJwt, checkRole(rolesPermitidos), CategoriaCtrl.eliminarCategoria);
router.patch('/:id/reactivar', authenticateJwt, checkRole(rolesPermitidos), CategoriaCtrl.reactivarCategoria);

export default router;