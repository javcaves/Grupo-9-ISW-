import { Router } from 'express';
import * as TurnoCtrl from './turno.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();

const rolesGestion    = ["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO"];
const rolesLectura    = ["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO", "EMPLEADO"];

// ==================== TURNO ====================

// ----- Rutas de lectura -----
router.get('/proyecto/:id_proyecto', authenticateJwt, checkRole(rolesLectura),  TurnoCtrl.listarTurnosPorProyecto); // Todos los turnos activos de un proyecto
router.get('/:id',                   authenticateJwt, checkRole(rolesLectura),  TurnoCtrl.obtenerTurno);            // Turno por ID

// ----- Rutas de escritura -----
router.post('/',    authenticateJwt, checkRole(rolesGestion), TurnoCtrl.crearTurno);       // Crear turno con empleados iniciales
router.put('/:id',  authenticateJwt, checkRole(rolesGestion), TurnoCtrl.actualizarTurno);  // Editar descripción / estado activo

// ----- Rutas de eliminación -----
router.delete('/:id', authenticateJwt, checkRole(rolesGestion), TurnoCtrl.eliminarTurno);  // Soft delete (requiere turno vacío)

// ==================== TURNO_EMPLEADO ====================

// ----- Rutas de escritura -----
router.post('/:id/empleados',    authenticateJwt, checkRole(rolesGestion), TurnoCtrl.agregarEmpleadoATurno);          // Agregar empleado al turno
router.put('/:id/empleados/:id_empleado/colacion',  authenticateJwt, checkRole(rolesGestion), TurnoCtrl.configurarColacion);             // Configurar horario de colación
router.put('/:id/empleados/:id_empleado/feriados',  authenticateJwt, checkRole(rolesGestion), TurnoCtrl.configurarTrabajadorFeriado);    // Configurar obligación en feriados

// ----- Rutas de eliminación -----
router.delete('/:id/empleados/:id_empleado',                   authenticateJwt, checkRole(rolesGestion), TurnoCtrl.eliminarEmpleadoDeTurno);           // Desvincular empleado (puede retornar requiere_confirmacion)
router.delete('/:id/empleados/:id_empleado/confirmar',         authenticateJwt, checkRole(rolesGestion), TurnoCtrl.confirmarEliminacionConAsistencia); // Confirmar desvinculación + baja asistencia del día

export default router;