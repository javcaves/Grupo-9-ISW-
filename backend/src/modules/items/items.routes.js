import { Router } from "express";
import * as ItemsCtrl from "./items.controller.js";
import { authenticateJwt } from "../../middlewares/auth.middleware.js";
import { checkRole } from "../../middlewares/role.middleware.js";

const router = Router();

// ================= RUTAS DE ESTADÍSTICAS =================
router.get('/stats/consumo', authenticateJwt, ItemsCtrl.verEstadisticasConsumo);

// ================= RUTAS DE ITEMS - LECTURA =================
router.get('/activos', authenticateJwt, ItemsCtrl.listarItemsActivos);
router.get('/proyecto/:id_proyecto/bajo-stock', authenticateJwt, ItemsCtrl.listarBajoStockProyecto);

// ================= RUTAS DE MOVIMIENTOS - LECTURA =================
router.get('/movimientos', authenticateJwt, ItemsCtrl.listarMovimientos);
router.get('/movimientos/solicitudes', authenticateJwt, ItemsCtrl.listarSolicitudesPendientes);

// ================= RUTAS DE ITEMS CON PARÁMETRO =================
router.get('/:id/movimientos', authenticateJwt, ItemsCtrl.listarMovimientosPorItem);
router.get('/:id', authenticateJwt, ItemsCtrl.getItem);
router.get('/', authenticateJwt, ItemsCtrl.listarItems);

// ================= RUTAS DE CONFIGURACIÓN DE STOCK =================
// Tanto el Supervisor como el Encargado pueden actualizar el inventario/auditar
router.put('/proyecto/:id_proyecto/auditar', authenticateJwt, checkRole(['SUPERVISOR', 'ENCARGADO']), ItemsCtrl.auditarInventarioProyecto);

// ================= RUTAS DE ITEMS - ESCRITURA =================
// El Supervisor es el único facultado para crear, modificar y eliminar ítems del catálogo
router.post('/', authenticateJwt, checkRole(['SUPERVISOR']), ItemsCtrl.createItem);
router.put('/:id', authenticateJwt, checkRole(['SUPERVISOR']), ItemsCtrl.updateItem);
router.delete('/:id', authenticateJwt, checkRole(['SUPERVISOR']), ItemsCtrl.deleteItem);

// ================= RUTAS DE MOVIMIENTOS - ESCRITURA =================
// Ambos roles pueden registrar flujos regulares de movimientos
router.post('/movimientos', authenticateJwt, checkRole(['SUPERVISOR', 'ENCARGADO']), ItemsCtrl.registrarMovimiento);

// Solo el Supervisor puede resolver (aprobar/rechazar) las solicitudes de ítems nuevos
router.patch('/movimientos/:id_mov/resolver', authenticateJwt, checkRole(['SUPERVISOR']), ItemsCtrl.resolverSolicitud);

// Eliminación de movimientos (la restricción de tiempo de 1 semana se controla internamente en el service)
router.delete('/movimientos/:id_mov', authenticateJwt, checkRole(['SUPERVISOR', 'ENCARGADO']), ItemsCtrl.removeMovimiento);

export default router;