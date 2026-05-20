import { Router } from "express";
import * as ItemsCtrl from "./items.controller.js";

const router = Router();

// ################# RUTAS DE ITEMS - LECTURA #################
router.get('/', ItemsCtrl.listarItems);                              // Todos los items
router.get('/activos', ItemsCtrl.listarItemsActivos);                // Solo activos
router.get('/bajo-stock', ItemsCtrl.listarBajoStock);                // Alertas de stock
router.get('/tipo/:tipo', ItemsCtrl.listarItemsPorTipo);             // Filtrar por tipo
router.get('/:id', ItemsCtrl.getItem);                               // Item por ID
 
// ################# RUTAS DE ITEMS - ESCRITURA #################
router.post('/', ItemsCtrl.createItem);                              // Crear item
router.put('/:id', ItemsCtrl.updateItem);                            // Actualizar item
 
// ################# RUTAS DE ITEMS - ELIMINACIÓN #################
router.delete('/:id', ItemsCtrl.deleteItem);                         // Soft delete
 
// ################# RUTAS DE MOVIMIENTOS - LECTURA #################
router.get('/movimientos', ItemsCtrl.listarMovimientos);             // Todos los movimientos
router.get('/movimientos/solicitudes', ItemsCtrl.listarSolicitudesPendientes); // Solicitudes pendientes
router.get('/movimientos/:id_mov', ItemsCtrl.obtenerMovimiento);     // Movimiento por ID
router.get('/:id/movimientos', ItemsCtrl.listarMovimientosPorItem);  // Historial de un item
 
// ################# RUTAS DE MOVIMIENTOS - ESCRITURA #################
router.post('/movimientos', ItemsCtrl.registrarMovimiento);          // Registrar movimiento
router.patch('/movimientos/:id_mov/resolver', ItemsCtrl.resolverSolicitud); // Aprobar/rechazar

export default router;
