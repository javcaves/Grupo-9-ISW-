import { Router } from 'express';
import InventarioRoutes from '../src/modules/bodega/inventario/inventario.routes.js';
import ItemsRoutes from '../src/modules/bodega/items/items.routes.js'; 
import TiposRoutes from '../src/modules/bodega/tipos/tipos.routes.js'; 

const router = Router();

router.use('/inventario', InventarioRoutes);
router.use('/items', TiposRoutes);
router.use('/tipos', ItemsRoutes);

export default router;