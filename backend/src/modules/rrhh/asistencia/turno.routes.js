import { Router } from 'express';
import * as TurnoController from './turno.controller.js';
import * as TurnoSchema from './turno.schema.js';

const router = Router();

/**
 * RUTAS DE TURNOS
 * Prefijo sugerido en el entry point: /turnos
 */

// --- LECTURA ---

/**
 * Obtener todos los turnos activos de un proyecto
 * Accesible para: ROOT, ADMIN, SUPERVISOR, ENCARGADO, EMPLEADO
 */
router.get('/proyecto/:idProyecto', 
    TurnoSchema.validarIdsParams, 
    TurnoController.obtenerTurnosPorProyecto
);


// --- GESTIÓN DE ESTRUCTURA (ENCARGADO / SUPERVISOR) ---

/**
 * Crear un nuevo turno
 * Requiere que el ejecutor sea SUPERVISOR o ENCARGADO del proyecto
 */
router.post('/', 
    TurnoSchema.validarCreacionTurno, 
    TurnoController.crearTurno
);

/**
 * Eliminar un turno (Solo si no tiene empleados vinculados)
 */
router.delete('/:idTurno', 
    TurnoSchema.validarIdsParams, 
    TurnoController.eliminarTurno
);


// --- GESTIÓN DE PERSONAL EN TURNO ---

/**
 * Asignar empleados a un turno existente
 * Recibe un array de empleados en el body
 */
router.post('/:idTurno/empleados', 
    TurnoSchema.validarIdsParams, 
    TurnoSchema.validarAsignacionEmpleados, 
    TurnoController.asignarEmpleadosATurno
);

/**
 * Desvincular a un empleado de un turno
 * Restricción: No se puede eliminar si el turno está en curso
 */
router.delete('/:idTurno/empleados/:idEmpleado', 
    TurnoSchema.validarIdsParams, 
    TurnoController.eliminarEmpleadoDeTurno
);

export default router;