import { Router } from 'express';
import * as InventarioCtrl from './inventario.controller.js';

const router = Router();

router.get('/', InventarioCtrl.listarProductos); 
router.get('/activos', InventarioCtrl.listarProductosActivos); 
router.get('/:id', InventarioCtrl.getProducto); 

router.post('/', InventarioCtrl.createProducto); 
router.put('/:id', InventarioCtrl.updateProducto); 
router.post('/asignar/:id', InventarioCtrl.updateToolAssignment); 

router.delete('/:id', InventarioCtrl.deleteProducto); 
router.delete('/hard/:id', InventarioCtrl.deleteProductoHard); 

export default router;