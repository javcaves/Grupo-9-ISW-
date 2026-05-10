import { Router } from 'express';
import * as PowerController from './power.controller.js';
import { validarAsignacionPower } from './power.schema.js';

const router = Router();

/**
 * RUTAS DE PODERES (Permissions)
 * Este router se monta usualmente bajo el prefijo /powers o /autorizaciones
 */

// --- LECTURA ---

/**
 * Obtener el catálogo maestro (Diccionario de poderes.json)
 * Público para lectura de usuarios autenticados
 */
router.get('/catalogo', PowerController.obtenerCatalogo);

/**
 * Obtener los poderes actuales de un usuario específico
 */
router.get('/usuario/:idUsuario', PowerController.obtenerPoderesDeUsuario);


// --- ESCRITURA (Gestión de Privilegios) ---

/**
 * Asignar o modificar poderes de un usuario
 * Requiere: 
 * 1. El poder 'USER:ASSIGN_POWER'
 * 2. Pasar la validación de estructura (Schema)
 * 3. Cumplir la regla de linaje (en el Controller/Service)
 */
router.post('/asignar/:idDestino', 
    PowerController.verificarPermiso('USER:ASSIGN_POWER'), 
    validarAsignacionPower, 
    PowerController.gestionarAsignacion
);

export default router;