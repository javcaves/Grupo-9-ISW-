import { Router } from 'express';
import ItemsRoutes from '../src/modules/items/items.routes.js'; 

const router = Router();

router.use('/items', ItemsRoutes);

export default router;