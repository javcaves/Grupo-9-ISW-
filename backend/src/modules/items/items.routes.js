import { Router } from "express";
import * as ItemsCtrl from "./items.controller.js";

const router = Router();

// ================= RUTAS DE ESTADÍSTICAS =================
router.get('/stats/consumo', ItemsCtrl.verEstadisticasConsumo);

// ================= RUTAS DE ITEMS - LECTURA =================
router.get('/activos', ItemsCtrl.listarItemsActivos);
router.get('/proyecto/:id_proyecto/bajo-stock', ItemsCtrl.listarBajoStockProyecto);

// ================= RUTAS DE MOVIMIENTOS - LECTURA =================
router.get('/movimientos', ItemsCtrl.listarMovimientos);
router.get('/movimientos/solicitudes', ItemsCtrl.listarSolicitudesPendientes);

// ================= RUTAS DE ITEMS CON PARÁMETRO =================
router.get('/:id/movimientos', ItemsCtrl.listarMovimientosPorItem);
router.get('/:id', ItemsCtrl.getItem);
router.get('/', ItemsCtrl.listarItems);

// ================= RUTAS DE CONFIGURACIÓN DE STOCK =================
router.put('/proyecto/:id_proyecto/auditar', ItemsCtrl.auditarInventarioProyecto);

// ================= RUTAS DE ITEMS - ESCRITURA =================
router.post('/', ItemsCtrl.createItem);
router.put('/:id', ItemsCtrl.updateItem);
router.delete('/:id', ItemsCtrl.deleteItem);

// ================= RUTAS DE MOVIMIENTOS - ESCRITURA =================
router.post('/movimientos', ItemsCtrl.registrarMovimiento);
router.patch('/movimientos/:id_mov/resolver', ItemsCtrl.resolverSolicitud);
router.delete('/movimientos/:id_mov', ItemsCtrl.removeMovimiento);

export default router;
