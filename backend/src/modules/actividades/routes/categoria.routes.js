import { Router } from 'express';
import * as CategoriaCtrl from '../controllers/categoria.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';

const router = Router();
const rolesPermitidos = ["ROOT", "ADMIN", "SUPERVISOR"]; 

router.get('/', authenticateJwt, CategoriaCtrl.listarCategorias);
router.get('/:id', authenticateJwt, CategoriaCtrl.obtenerCategoria);
router.post('/', authenticateJwt, checkRole(rolesPermitidos), CategoriaCtrl.registrarCategoria);
router.put('/:id', authenticateJwt, checkRole(rolesPermitidos), CategoriaCtrl.actualizarCategoria);
router.delete('/:id', authenticateJwt, checkRole(rolesPermitidos), CategoriaCtrl.eliminarCategoria);

export default router;