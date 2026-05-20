import { Router } from 'express';
import * as ProyectoController from './proyecto.controller.js';
import * as ProyectoSchema from '../entity/proyecto.schema.js';

const router = Router();

/**
 * RUTAS DE PROYECTOS
 * Prefijo sugerido: /proyectos
 */

// --- RUTAS ADMINISTRATIVAS (ROOT / ADMIN) ---

/**
 * 1. Crear un nuevo proyecto y asignar personal inicial
 */
router.post('/', 
    ProyectoSchema.validarCreacionProyecto, 
    ProyectoController.crearProyecto
);

/**
 * 2. Modificar datos del proyecto, estados o límites de personal
 */
router.put('/:id', 
    ProyectoSchema.validarProyectoId,
    ProyectoSchema.validarEdicionProyecto, 
    ProyectoController.editarProyecto
);


// --- RUTAS DE CONSULTA (ROOT, ADMIN, SUPERVISOR, ENCARGADO) ---

/**
 * Obtener proyectos vinculados al usuario logueado
 * Filtra automáticamente según el rol del ejecutor
 */
router.get('/', 
    ProyectoController.obtenerMisProyectos
);

/**
 * Ver la lista de personal (Encargados, Supervisores, Empleados) de un proyecto
 * Útil para que el Encargado gestione su equipo
 */
router.get('/:id/personal', 
    ProyectoSchema.validarProyectoId, 
    ProyectoController.obtenerPersonalProyecto
);

export default router;