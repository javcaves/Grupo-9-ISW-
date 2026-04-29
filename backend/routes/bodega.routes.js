import { Router } from "express";
import InventarioCtrl from "../src/modules/bodega/inventario/inventario.controller.js";

const router = Router();

// Tienes que definir qué método y qué ruta corresponden a qué función del controlador
// Supongamos que estas son tus rutas para /inventario:

// Obtener todos los productos: GET /bodega/inventario
router.get('/inventario', InventarioCtrl.listarProductos);

// Obtener activos: GET /bodega/inventario/activos
router.get('/inventario/activos', InventarioCtrl.listarProductosActivos);

// Crear producto: POST /bodega/inventario
router.post('/inventario', InventarioCtrl.createProducto);

// Actualizar: PUT /bodega/inventario/:id
router.put('/inventario/:id', InventarioCtrl.updateProducto);

// Eliminar: DELETE /bodega/inventario/:id
router.delete('/inventario/:id', InventarioCtrl.deleteProducto);

export default router;