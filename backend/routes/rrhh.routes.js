import { Router } from 'express';
import EmpleadosRoutes from '../src/modules/rrhh/empleados/empleados.routes.js';
import AsistenciaRoutes from '../src/modules/rrhh/asistencia/asistencia.routes.js';


const router = Router();

router.use('/empleados', EmpleadosRoutes);
router.use('/asistencia', AsistenciaRoutes);

export default router;