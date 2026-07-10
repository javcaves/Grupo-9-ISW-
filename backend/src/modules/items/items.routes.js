import { Router } from "express";
import * as ItemsCtrl from "./items.controller.js";
import { authenticateJwt } from "../../middlewares/auth.middleware.js";
import { checkRole } from "../../middlewares/role.middleware.js";

const router = Router();

// ================= RUTAS DE ESTADÍSTICAS =================
router.get('/stats/consumo', authenticateJwt, ItemsCtrl.verEstadisticasConsumo);

// ================= RUTAS DE ITEMS - LECTURA =================
router.get('/activos', authenticateJwt, ItemsCtrl.listarItemsActivos);
router.get('/bajo-stock', authenticateJwt, ItemsCtrl.listarBajoStockGlobal);
router.get('/proyecto/:id_proyecto/bajo-stock', authenticateJwt, ItemsCtrl.listarBajoStockProyecto);
router.get('/proyecto/:id_proyecto', authenticateJwt, ItemsCtrl.listarItemsProyecto);

// ================= RUTAS DE MOVIMIENTOS - LECTURA =================
router.get('/movimientos', authenticateJwt, ItemsCtrl.listarMovimientos);
router.get('/movimientos/solicitudes', authenticateJwt, ItemsCtrl.listarSolicitudesPendientes);

// ================= RUTAS DE ITEMS CON PARÁMETRO =================
router.get('/:id/movimientos', authenticateJwt, ItemsCtrl.listarMovimientosPorItem);
router.get('/:id', authenticateJwt, ItemsCtrl.getItem);
router.get('/', authenticateJwt, ItemsCtrl.listarItems);

// ================= RUTAS DE CONFIGURACIÓN DE STOCK =================
// Tanto el Supervisor como el Encargado pueden actualizar el inventario/auditar
router.put('/proyecto/:id_proyecto/auditar', authenticateJwt, checkRole(['ROOT','SUPERVISOR', 'ENCARGADO']), ItemsCtrl.auditarInventarioProyecto);

// El Supervisor (y ADMIN) vinculan items ya existentes del catálogo a un proyecto, o los desvinculan
router.post('/proyecto/:id_proyecto/vincular', authenticateJwt, checkRole(['ROOT','ADMIN','SUPERVISOR','ENCARGADO']), ItemsCtrl.vincularItemProyecto);
router.delete('/proyecto/:id_proyecto/item/:id_item', authenticateJwt, checkRole(['ROOT','ADMIN','SUPERVISOR','ENCARGADO']), ItemsCtrl.desvincularItemProyecto);
// ================= RUTAS DE ITEMS - ESCRITURA =================
// El Supervisor (y ADMIN) son los facultados para crear, modificar y eliminar ítems del catálogo
router.post('/', authenticateJwt, checkRole(['ROOT','ADMIN','SUPERVISOR']), ItemsCtrl.createItem);
router.put('/:id', authenticateJwt, checkRole(['ROOT','ADMIN','SUPERVISOR']), ItemsCtrl.updateItem);
router.delete('/:id', authenticateJwt, checkRole(['ROOT','ADMIN','SUPERVISOR']), ItemsCtrl.deleteItem);

// ================= RUTAS DE MOVIMIENTOS - ESCRITURA =================
// Ambos roles pueden registrar flujos regulares de movimientos
router.post('/movimientos', authenticateJwt, checkRole(['ROOT','SUPERVISOR', 'ENCARGADO']), ItemsCtrl.registrarMovimiento);

// El Supervisor (y ADMIN) pueden resolver (aprobar/rechazar) las solicitudes de ítems nuevos
router.patch('/movimientos/:id_mov/resolver', authenticateJwt, checkRole(['ROOT','ADMIN','SUPERVISOR']), ItemsCtrl.resolverSolicitud);

// Eliminación de movimientos (la restricción de tiempo de 1 semana se controla internamente en el service)
router.delete('/movimientos/:id_mov', authenticateJwt, checkRole(['ROOT','SUPERVISOR', 'ENCARGADO']), ItemsCtrl.removeMovimiento);

export default router;