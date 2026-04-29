import { Router } from 'express';
import ActividadesRoutes from '../src/modules/gestion_actividades/actividades/actividades.routes.js';
import CategoriasRoutes from '../src/modules/gestion_actividades/categorias/categorias.routes.js';

const router = Router();

router.use('/actividades', ActividadesRoutes);
router.use('/categorias', CategoriasRoutes);

export default router;