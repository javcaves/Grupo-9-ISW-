import { Router } from "express";
import * as ItemsCtrl from "./items.controller.js";
import { isAuth } from "../../middlewares/auth.middleware.js";
import { isRole } from "../../middlewares/role.middleware.js";

const router = Router();

// ================= RUTAS DE ESTADÍSTICAS =================
router.get('/stats/consumo', isAuth, ItemsCtrl.verEstadisticasConsumo);

// ================= RUTAS DE ITEMS - LECTURA =================
router.get('/activos', isAuth, ItemsCtrl.listarItemsActivos);
router.get('/proyecto/:id_proyecto/bajo-stock', isAuth, ItemsCtrl.listarBajoStockProyecto);

// ================= RUTAS DE MOVIMIENTOS - LECTURA =================
router.get('/movimientos', isAuth, ItemsCtrl.listarMovimientos);
router.get('/movimientos/solicitudes', isAuth, ItemsCtrl.listarSolicitudesPendientes);

// ================= RUTAS DE ITEMS CON PARÁMETRO =================
router.get('/:id/movimientos', isAuth, ItemsCtrl.listarMovimientosPorItem);
router.get('/:id', isAuth, ItemsCtrl.getItem);
router.get('/', isAuth, ItemsCtrl.listarItems);

// ================= RUTAS DE CONFIGURACIÓN Y AUDITORÍA DE STOCK =================
// Tanto el Supervisor como el Encargado pueden registrar la auditoría física del inventario
router.put('/proyecto/:id_proyecto/auditar', isAuth, isRole(['SUPERVISOR', 'ENCARGADO']), ItemsCtrl.auditarInventarioProyecto);

// ================= RUTAS DE ITEMS - ESCRITURA =================
// Operaciones de catálogo exclusivas del Supervisor (definición de la naturaleza del ítem)
router.post('/', isAuth, isRole(['SUPERVISOR']), ItemsCtrl.createItem);
router.put('/:id', isAuth, isRole(['SUPERVISOR']), ItemsCtrl.updateItem);
router.delete('/:id', isAuth, isRole(['SUPERVISOR']), ItemsCtrl.deleteItem);

// ================= RUTAS DE MOVIMIENTOS - ESCRITURA =================
// Ambos roles pueden registrar flujos de inventario regulares (Entradas, Salidas, Solicitudes)
router.post('/movimientos', isAuth, isRole(['SUPERVISOR', 'ENCARGADO']), ItemsCtrl.registrarMovimiento);

// Solo el Supervisor tiene la facultad de evaluar, aprobar o rechazar solicitudes entrantes
router.patch('/movimientos/:id_mov/resolver', isAuth, isRole(['SUPERVISOR']), ItemsCtrl.resolverSolicitud);

// Eliminación de movimientos permitida para ambos roles (restringida a 7 días en el servicio)
router.delete('/movimientos/:id_mov', isAuth, isRole(['SUPERVISOR', 'ENCARGADO']), ItemsCtrl.removeMovimiento);

export default router;
