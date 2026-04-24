import { Router } from "express";
import * as InventarioCtrl from "./inventario.controller.js";

const router = Router();

// ################# RUTAS DE LECTURA #################
router.get('/', InventarioCtrl.listarProductos);           // Obtener todos
router.get('/activos', InventarioCtrl.listarProductosActivos);  // Obtener activos
router.get('/:id', InventarioCtrl.getProducto);    // Obtener por ID

// ################# RUTAS DE ESCRITURA #################
router.post('/', InventarioCtrl.createProducto);        // Crear nuevo producto
router.put('/:id', InventarioCtrl.updateProducto); // Actualizar producto

// ################# RUTAS DE ELIMINACIÓN #################
router.delete('/:id', InventarioCtrl.deleteProducto);           // Soft Delete
router.delete('/hard/:id', InventarioCtrl.deleteProductoHard); // Hard Delete

export default router;
