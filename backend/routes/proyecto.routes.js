import { Router } from 'express';
import ProyectoRoutes from '../src/modules/proyecto/proyecto.routes.js'; 

const router = Router();

router.use('/proyecto',ProyectoRoutes);

export default router;