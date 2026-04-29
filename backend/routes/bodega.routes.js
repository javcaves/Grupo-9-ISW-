import { Router } from 'express';
import InventarioRoutes from '../src/modules/bodega/inventario/inventario.routes.js'; 

const router = Router();

router.use('/inventario', InventarioRoutes);

export default router;