import { Router } from 'express';
import ActividadesRoutes from '../src/modules/actividades/actividades.routes.js';
import CategoriasRoutes from '../src/modules/categorias/categorias.routes.js';

const router = Router();

router.use('/actividades', ActividadesRoutes);
router.use('/categorias', CategoriasRoutes);

export default router;