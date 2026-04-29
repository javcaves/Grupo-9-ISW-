import { Router } from 'express';
import * as AsistenciaCtrl from './asistencia.controller.js';

const router = Router();

// ################# RUTAS DE LECTURA #################

// Obtener todas las cabeceras de asistencia activas
router.get('/', AsistenciaCtrl.listarAsistencias);

// Obtener el detalle de todos los empleados de una asistencia específica
router.get('/detalle/:id', AsistenciaCtrl.obtenerDetalleAsistencia);

// Buscador dinámico en los registros de asistencia (por apellido o correo)
router.get('/buscar', AsistenciaCtrl.buscarEnAsistencias);

// ################# RUTAS DE ESCRITURA #################

// Crear una nueva jornada/cabecera de asistencia
router.post('/cabecera', AsistenciaCtrl.crearCabeceraAsistencia);

// Registrar a un empleado en una asistencia existente
router.post('/registrar-empleado', AsistenciaCtrl.registrarEmpleadoEnAsistencia);

// Actualizar datos de la cabecera (ej. cerrar jornada)
router.put('/cabecera/:id', AsistenciaCtrl.actualizarCabecera);

// Actualizar registro de un empleado (ej. marcar salida o cambiar estado)
router.put('/empleado/:id', AsistenciaCtrl.actualizarRegistroEmpleado);

// ################# RUTAS DE ELIMINACIÓN #################

// Desactivar asistencia completa y sus registros (Soft Delete)
router.delete('/:id', AsistenciaCtrl.eliminarAsistencia);

// Eliminar físicamente un registro de empleado (Hard Delete por error de ingreso)
router.delete('/detalle/hard/:id', AsistenciaCtrl.borrarDetalleFisico);

export default router;