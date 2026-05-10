import { Router } from 'express';
import UsuarioRoutes from '../src/modules/usuario/usuario.routes.js';
import AsistenciaRoutes from '../src/modules/asistencia/asistencia.routes.js';
import TurnoRoutes from '../src/modules/turno/turno.routes.js';
import PowerRoutes from '../src/modules/power/power.routes.js';


const router = Router();

router.use('/usuarios', UsuarioRoutes);
router.use('/asistencia', AsistenciaRoutes);
router.use('/power', PowerRoutes);
router.use('/turno', TurnoRoutes);

export default router;