import { Router } from "express";
import * as TiposCtrl from "./tipos.controller.js";

const router = Router();

// ################# RUTAS DE LECTURA #################
router.get('/', TiposCtrl.listarTipos);                // Obtener todos
router.get('/activos', TiposCtrl.listarTiposActivos);  // Obtener activos
router.get('/:id', TiposCtrl.getTipo);                 // Obtener por ID

// ################# RUTAS DE ESCRITURA #################
router.post('/', TiposCtrl.createTipo);                // Crear nuevo tipo
router.put('/:id', TiposCtrl.updateTipo);              // Actualizar tipo

// ################# RUTAS DE ELIMINACIÓN #################
router.delete('/:id', TiposCtrl.deleteTipo);           // Soft Delete
router.delete('/hard/:id', TiposCtrl.deleteTipoHard);  // Hard Delete

export default router;
