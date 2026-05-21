import { Router } from 'express';

// MÓDULO DE AUTENTICACIÓN
import AuthRoutes from './auth.routes.js'; 

// MIDDLEWARE INTERCEPTOR GLOBAL
import { authenticateJwt } from '../middlewares/auth.middleware.js';

// MÓDULO DE ACTIVIDADES
import ActividadesRoutes from '../modules/actividades/actividades.routes.js';
import CategoriasRoutes from '../modules/categoria/categoria.routes.js';

// MÓDULO DE INVENTARIO
import ItemsRoutes from '../modules/items/items.routes.js';

// MÓDULO DE PROYECTOS
import ProyectoRoutes from '../modules/usuario-proyecto/routes/proyecto.routes.js';

// MÓDULO DE RECURSOS HUMANOS (RRHH)
import UsuarioRoutes from '../modules/usuario-proyecto/routes/usuario.routes.js';
import AsistenciaRoutes from '../modules/asistencia/asistencia.routes.js';
import TurnoRoutes from '../modules/turno/turno.routes.js';
import PowerRoutes from '../modules/usuario-proyecto/routes/power.routes.js';

const router = Router();

// =============================================
// 1. RUTAS PÚBLICAS
// =============================================
// Rutas de login y logout que no requieren token previo
router.use('/auth', AuthRoutes); 


// =============================================
// 2. FILTRO DE AUTENTICACIÓN GLOBAL (JWT)
// =============================================
// A partir de aquí, cualquier ruta hacia abajo exige una cookie de sesión válida
router.use(authenticateJwt);


// =============================================
// 3. RUTAS PROTEGIDAS (Control de roles interno por módulo)
// =============================================

// ACTIVIDADES & PROYECTOS
router.use('/actividades', ActividadesRoutes);
router.use('/categorias', CategoriasRoutes);
router.use('/proyecto', ProyectoRoutes);

// INVENTARIO
router.use('/items', ItemsRoutes); 

// RECURSOS HUMANOS (RRHH)
router.use('/usuarios', UsuarioRoutes);
router.use('/asistencia', AsistenciaRoutes);
router.use('/turno', TurnoRoutes);
router.use('/power', PowerRoutes); 

export default router;