import { Router } from "express";
// Importación por defecto (sin llaves y sin * as)
import InventarioCtrl from "./inventario.controller.js";

const router = Router();

// ################# RUTAS DE LECTURA #################
router.get('/', InventarioCtrl.listarProductos);
router.get('/activos', InventarioCtrl.listarProductosActivos);
router.get('/:id', InventarioCtrl.getProducto);

// ################# RUTAS DE ESCRITURA #################
router.post('/', InventarioCtrl.createProducto);
router.put('/:id', InventarioCtrl.updateProducto);
// Agregamos la ruta de asignación que está en tu controlador
router.post('/asignar/:id', InventarioCtrl.updateToolAssignment);

// ################# RUTAS DE ELIMINACIÓN #################
router.delete('/:id', InventarioCtrl.deleteProducto);
router.delete('/hard/:id', InventarioCtrl.deleteProductoHard);

export default router;