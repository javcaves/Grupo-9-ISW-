// /src/module/asistencia/asistencia.routes.js
import { Router } from "express";
import * as AsistenciaCtrl from "./asistencia.controller.js";
import { authenticateJwt } from "../../middlewares/auth.middleware.js";
import { checkRole } from "../../middlewares/role.middleware.js";

const router = Router();

const rolesGestion = ["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO"];
const rolesEmpleado = ["EMPLEADO"];

// ==================== ENDPOINTS DE ENCARGADOS ====================

// RF-ASISTENCIA-1: Crear jornada diaria y snapshot
router.post("/", authenticateJwt, checkRole(rolesGestion), AsistenciaCtrl.crearAsistencia);

// RF-ASISTENCIA-2: Mostrar la asistencia activa y QR del turno
router.get("/turno/:id_turno/actual", authenticateJwt, checkRole(rolesGestion), AsistenciaCtrl.mostrarAsistenciaActual);

// RF-ASISTENCIA-3: Modificación manual en tiempo real de un empleado
router.put("/:id_asistencia/empleado/:id_empleado", authenticateJwt, checkRole(rolesGestion), AsistenciaCtrl.editarRegistroIndividual);

// RF-ASISTENCIA-4: Cancelar asistencia completa
router.delete("/:id_asistencia", authenticateJwt, checkRole(rolesGestion), AsistenciaCtrl.eliminarAsistencia);

// RF-ASISTENCIA-5: Ver listado histórico por proyecto y modificar registros pasados
router.get("/proyecto/:id_proyecto/historial", authenticateJwt, checkRole(rolesGestion), AsistenciaCtrl.listarHistorial);
router.put("/:id_asistencia/empleado/:id_empleado/historial", authenticateJwt, checkRole(rolesGestion), AsistenciaCtrl.editarHistorialPasado);


// ==================== ENDPOINTS DE EMPLEADOS ====================
router.get("/mi-turno", authenticateJwt, checkRole(rolesEmpleado), AsistenciaCtrl.obtenerMiTurno);
// OPTIMIZADO: Ruta estática semántica explícita para el estado diario del Dashboard
router.get("/mi-asistencia-hoy", authenticateJwt, checkRole(rolesEmpleado), AsistenciaCtrl.obtenerMiAsistenciaActual);

// RF-ASISTENCIA-6: Auto-marcaje de asistencia por Token/QR con Geolocalización
router.post("/marcar", authenticateJwt, checkRole(rolesEmpleado), AsistenciaCtrl.registrarAutoAsistenciaEmpleado);

// RF-ASISTENCIA-7: Ver historial personal del empleado (Con parámetro dinámico al final)
router.get("/proyecto/:id_proyecto/mis-asistencias", authenticateJwt, checkRole(rolesEmpleado), AsistenciaCtrl.obtenerMisAsistenciasPorProyecto);


export default router;