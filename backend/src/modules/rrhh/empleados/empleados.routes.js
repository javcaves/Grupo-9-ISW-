import { Router } from 'express';
import * as EmpleadosCtrl from './empleados.controller.js';

const router = Router();

// ################# RUTAS DE LECTURA #################
router.get('/', EmpleadosCtrl.listarTodos);           // Obtener todos
router.get('/activos', EmpleadosCtrl.listarActivos);  // Obtener activos (opcional: cargo)
router.get('/buscar', EmpleadosCtrl.buscarEmpleados); // Buscador dinámico
router.get('/:id', EmpleadosCtrl.obtenerEmpleado);    // Obtener por ID

// ################# RUTAS DE ESCRITURA #################
router.post('/registrar', EmpleadosCtrl.registrarEmpleado); // Registrar operativo
router.post('/registrar-admin', EmpleadosCtrl.registrarAdmin); // Registrar admin
router.put('/:id', EmpleadosCtrl.actualizarEmpleado);     // Actualizar

// ################# RUTAS DE ELIMINACIÓN #################
router.delete('/:id', EmpleadosCtrl.eliminarEmpleado);           // Soft Delete
router.delete('/hard/:id', EmpleadosCtrl.borrarEmpleadoDefinitivamente); // Hard Delete

export default router;