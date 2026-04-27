import { Router } from 'express';
import * as ActividadesCtrl from './actividades.controller.js';

const router = Router();

// ----- Rutas delectura ------
router.get('/', ActividadesCtrl.listarCatalogo); // Catálogo completo
router.get('/activos', ActividadesCtrl.listarCatalogo); // Obtener solo activos
router.get('/buscar', ActividadesCtrl.buscarActividades); // Busca por nombre de tarea
router.get('/:id', ActividadesCtrl.obtenerActividad); // Obtener por ID

// ----- Rutas de escritura -----
router.post('/registrar', ActividadesCtrl.registrarEnCatalogo); // Registrar nueva tarea
router.put('/:id', ActividadesCtrl.actualizarActividad); // Actualizar nombre o categoría

// ----- Rutas de eliminacion -----
router.delete('/:id', ActividadesCtrl.eliminarDelCatalogo); // Soft Delete (Desactivar del catálogo)
router.delete('/hard/:id', ActividadesCtrl.borrarActividadDefinitivamente); // Hard Delete (Solo desarrollo)

export default router;