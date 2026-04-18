import { Router } from 'express';
import empleadosRoutes from '../src/modules/rrhh/empleados/empleados.routes.js';


const router = Router();

router.use('/empleados', empleadosRoutes);

export default router;