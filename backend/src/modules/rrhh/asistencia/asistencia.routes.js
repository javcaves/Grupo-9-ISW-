import { Router } from 'express';
import * as AsistenciaController from './asistencia.controller.js';
import * as AsistenciaSchema from './asistencia.schema.js';

const router = Router();

/**
 * RUTAS DE ASISTENCIA
 * Prefijo sugerido: /asistencia
 */

// --- GESTIÓN DEL ENCARGADO / SUPERVISOR ---

/**
 * 1. Generar asistencia y Token/QR para un turno
 * Requiere poder: ASIS:CRUD
 */
router.post('/generar', 
    AsistenciaSchema.validarCreacionAsistencia, 
    AsistenciaController.crearAsistencia
);

/**
 * 2, 3 y 5. Historial y Visualización de detalles
 */
router.get('/historial', AsistenciaController.obtenerHistorial);
router.get('/:idAsistencia/detalle', AsistenciaController.obtenerDetalleAsistencia);

/**
 * 3. Edición manual de un registro de empleado (Estado, Hora, Descripción)
 * Requiere poder: ASIS:CRUD
 */
router.put('/:idAsistencia/empleado/:idEmpleado', 
    AsistenciaSchema.validarEdicionAsistencia, 
    AsistenciaController.actualizarEstadoManual
);

/**
 * 4. Eliminar una asistencia (Solo si no hay marcas activas)
 */
router.delete('/:idAsistencia', AsistenciaController.eliminarAsistencia);


// --- OPERATIVA DEL EMPLEADO ---

/**
 * 6. Registro de asistencia mediante Token
 * El empleado usa esta ruta para marcar su ingreso
 */
router.post('/marcar', 
    AsistenciaSchema.validarRegistroToken, 
    AsistenciaController.registrarMarcaEmpleado
);

export default router;