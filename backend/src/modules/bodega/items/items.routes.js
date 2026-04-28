import { Router } from "express";
import * as ItemsCtrl from "./items.controller.js";

const router = Router();

// ################# RUTAS DE LECTURA #################
router.get('/', ItemsCtrl.listarItems);                      // Obtener todos los items
router.get('/activos', ItemsCtrl.listarItemsActivos);        // Obtener items activos
router.get('/tipo/:id_tipo', ItemsCtrl.listarItemsPorTipo);  // Filtrar por tipo
router.get('/:id', ItemsCtrl.getItem);                       // Obtener por ID

// ################# RUTAS DE ESCRITURA #################
router.post('/', ItemsCtrl.createItem);                      // Crear item
router.put('/:id', ItemsCtrl.updateItem);                    // Actualizar item

// ################# RUTAS DE ELIMINACIÓN #################
router.delete('/:id', ItemsCtrl.deleteItem);                 // Soft Delete
router.delete('/hard/:id', ItemsCtrl.deleteItemHard);        // Hard Delete

export default router;
