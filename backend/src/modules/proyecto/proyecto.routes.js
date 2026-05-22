import { Router } from 'express';
import * as ProyectoController from './proyecto.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();


router.post('/', 
    authenticateJwt,
    checkRole(['ROOT', 'ADMIN']),
    ProyectoController.crearProyecto
);

/**
 * 2. Modificar datos del proyecto, estados o límites de personal
 */
router.put('/:id_proyecto', 
    authenticateJwt,
    checkRole(['ROOT', 'ADMIN']), 
    ProyectoController.editarProyecto
);


// --- RUTAS DE CONSULTA (ROOT, ADMIN, SUPERVISOR, ENCARGADO) ---

/**
 * Obtener proyectos vinculados al usuario logueado
 * Filtra automáticamente según el rol del ejecutor
 */
router.get('/', 
    authenticateJwt,
    ProyectoController.obtenerMisProyectos
);

/**
 * Ver la lista de personal (Encargados, Supervisores, Empleados) de un proyecto
 * Útil para que el Encargado gestione su equipo
 */
router.get('/todos', 
    authenticateJwt, checkRole(['ROOT', 'ADMIN']), ProyectoController.obtenerTodosProyectos
);

router.get('/:id_proyecto', 
    authenticateJwt, checkRole(['ROOT', 'ADMIN']), ProyectoController.obtenerProyectosPorId
);

router.delete('/:id_proyecto', 
    authenticateJwt, checkRole(['ROOT', 'ADMIN']), ProyectoController.eliminarProyecto
);

export default router;