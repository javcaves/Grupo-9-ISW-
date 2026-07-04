// /src/module/asistencia/asistencia.routes.js

import { Router } from "express";
import * as AsistenciaCtrl from "./asistencia.controller.js";
import { authenticateJwt } from "../../middlewares/auth.middleware.js";
import { checkRole } from "../../middlewares/role.middleware.js";

const router = Router();

const rolesGestion = ["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO"];
const rolesEmpleado = ["EMPLEADO"];

// ============================================================================
// ENDPOINTS DE GESTIÓN
// ============================================================================

// RF-ASISTENCIA-1
router.post(
    "/",
    authenticateJwt,
    checkRole(rolesGestion),
    AsistenciaCtrl.crearAsistencia
);

// RF-ASISTENCIA-2
router.get(
    "/turno/:id_turno/actual",
    authenticateJwt,
    checkRole(rolesGestion),
    AsistenciaCtrl.mostrarAsistenciaActual
);

// RF-ASISTENCIA-3
router.put(
    "/:id_asistencia/empleado/:id_empleado",
    authenticateJwt,
    checkRole(rolesGestion),
    AsistenciaCtrl.editarRegistroIndividual
);

// RF-ASISTENCIA-4
router.delete(
    "/:id_asistencia",
    authenticateJwt,
    checkRole(rolesGestion),
    AsistenciaCtrl.eliminarAsistencia
);

router.patch(
    "/:id_asistencia/finalizar",
    authenticateJwt,
    checkRole(rolesGestion),
    AsistenciaCtrl.finalizarAsistencia
);

// RF-ASISTENCIA-5
router.get(
    "/proyecto/:id_proyecto/historial",
    authenticateJwt,
    checkRole(rolesGestion),
    AsistenciaCtrl.listarHistorial
);

router.put(
    "/:id_asistencia/empleado/:id_empleado/historial",
    authenticateJwt,
    checkRole(rolesGestion),
    AsistenciaCtrl.editarHistorialPasado
);


// ============================================================================
// ENDPOINTS EMPLEADO
// ============================================================================

// Turno asignado
router.get(
    "/mi-turno",
    authenticateJwt,
    checkRole(rolesEmpleado),
    AsistenciaCtrl.obtenerMiTurno
);

// Estado del día
router.get(
    "/mi-asistencia-hoy",
    authenticateJwt,
    checkRole(rolesEmpleado),
    AsistenciaCtrl.obtenerMiAsistenciaActual
);

// Marcaje mediante QR
router.post(
    "/marcar",
    authenticateJwt,
    checkRole(rolesEmpleado),
    AsistenciaCtrl.registrarAutoAsistenciaEmpleado
);

router.get(
    "/mi-historial",
    authenticateJwt,
    checkRole(rolesEmpleado),
    AsistenciaCtrl.obtenerMiHistorial
);

export default router;