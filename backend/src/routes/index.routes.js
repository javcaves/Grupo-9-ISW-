import { Router } from 'express';

// ACTIVIDADES
import ActividadesRoutes from '../modules/actividades/actividades.routes.js';
import CategoriasRoutes from '../modules/categoria/categoria.routes.js';

// INVENTARIO
import ItemsRoutes from '../modules/items/items.routes.js';

// PROYECTOS
import ProyectoRoutes from '../modules/proyecto/proyecto.routes.js';

// RRHH
import UsuarioRoutes from '../modules/usuario/usuario.routes.js';
import AsistenciaRoutes from '../modules/asistencia/asistencia.routes.js';
import TurnoRoutes from '../modules/turno/turno.routes.js';
import PowerRoutes from '../modules/power/power.routes.js';

const router = Router();


// =============================
// ACTIVIDADES
// =============================

router.use('/actividades', ActividadesRoutes);
router.use('/categorias', CategoriasRoutes);


// =============================
// INVENTARIO
// =============================

router.use('/items', ItemsRoutes);


// =============================
// PROYECTOS
// =============================

router.use('/proyecto', ProyectoRoutes);


// =============================
// RECURSOS HUMANOS
// =============================

router.use('/usuarios', UsuarioRoutes);
router.use('/asistencia', AsistenciaRoutes);
router.use('/power', PowerRoutes);
router.use('/turno', TurnoRoutes);


export default router;