import { Router } from 'express';
import actividadesRoutes from '../src/modules/gestion_actividades/actividades/actividades.routes.js';

const router = Router();

router.use('/actividades', actividadesRoutes);

export default router;