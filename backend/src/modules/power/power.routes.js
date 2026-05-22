import { Router } from 'express';
import * as PowerController from './power.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
//AGREGAR CHECKROLE EN MIDDLEWARE
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();

//obtener catalogo
router.get('/catalogo', authenticateJwt, PowerController.obtenerCatalogo);
//obtener usuario
router.get('/usuario/:idUsuario', authenticateJwt, PowerController.obtenerPoderesDeUsuario);

//
/**
 * Asignar o modificar poderes de un usuario
 * Requiere: 
 * 1. El poder 'USER:ASSIGN_POWER'
 * 2. Pasar la validación de estructura (Schema)
 * 3. Cumplir la regla de linaje (en el Controller/Service)
 */
router.post('/asignar/:idDestino', 
    authenticateJwt, 
    checkRole(['ROOT', 'ADMIN']), 
    PowerController.gestionarAsignacion
);

export default router;