import { Router } from 'express';
import * as ProyectoUsuarioController from './proyecto_usuario.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();

router.post('/:idProyecto/usuarios', authenticateJwt, checkRole(['ROOT', 'ADMIN', 'SUPERVISOR', 'ENCARGADO']), 
    ProyectoUsuarioController.asignarUsuarioAProyecto
);

router.get('/:idProyecto/usuarios', authenticateJwt, ProyectoUsuarioController.obtenerUsuariosDelProyecto);

router.delete('/:idProyecto/usuarios/:idUsuario', authenticateJwt, checkRole(['ROOT', 'ADMIN', 'SUPERVISOR']), 
    ProyectoUsuarioController.desvincularUsuarioDeProyecto
);

export default router;