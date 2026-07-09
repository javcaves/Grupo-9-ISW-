import { Router } from 'express';

// MÓDULO DE AUTENTICACIÓN
import AuthRoutes from './auth.routes.js'; 

// MIDDLEWARE INTERCEPTOR GLOBAL
import { authenticateJwt } from '../middlewares/auth.middleware.js';

// Controller usado directo acá solo para la ÚNICA ruta pública de
// notificaciones (solicitud de recuperación de contraseña). El resto de
// rutas de notificaciones vive en notificacion.routes.js y se monta más
// abajo, después del filtro global.
import * as NotificacionController from '../modules/notificaciones/notificacion.controller.js';

// MÓDULO DE ACTIVIDADES
import ActividadesRoutes from '../modules/actividades/actividades.routes.js';
import CategoriasRoutes from '../modules/categoria/categoria.routes.js';
import CalificacionRoutes from '../modules/calificacion/calificacion.routes.js';
import EvaluacionRoutes from '../modules/evaluacion/evaluacion.routes.js';
import TareasRoutes from '../modules/tarea/tarea.routes.js';
import AsignacionRoutes from '../modules/asignacion/asignacion.routes.js';

// MÓDULO DE INVENTARIO
import ItemsRoutes from '../modules/items/items.routes.js';
import NotificacionesRouter from '../modules/notificaciones/notificacion.routes.js';

// MÓDULO DE PROYECTOS
import ProyectoRoutes from '../modules/proyecto/proyecto.routes.js';
import ProyectoUsuarioRoutes from '../modules/proyecto/proyecto_usuario.routes.js'

// MÓDULO DE RECURSOS HUMANOS (RRHH)
import UsuarioRoutes from '../modules/usuario/usuario.routes.js';
import AsistenciaRoutes from '../modules/asistencia/asistencia.routes.js';
import TurnoRoutes from '../modules/turno/turno.routes.js';

// DASHBOARD
import DashboardRoutes from '../modules/dashboard/dashboard.routes.js';

const router = Router();

// =============================================
// 1. RUTAS PÚBLICAS
// =============================================
// Rutas de login y logout que no requieren token previo
router.use('/auth', AuthRoutes); 
router.post('/notificaciones/solicitud-password', NotificacionController.solicitarRecuperacionPassword);


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
router.use('/proyecto', ProyectoUsuarioRoutes);
router.use('/tareas', TareasRoutes);
router.use('/asignacion', AsignacionRoutes);

// INVENTARIO
router.use('/items', ItemsRoutes); 
router.use('/notificaciones', NotificacionesRouter);

// RECURSOS HUMANOS (RRHH)
router.use('/usuarios', UsuarioRoutes);
router.use('/asistencia', AsistenciaRoutes);
router.use('/turno', TurnoRoutes);
router.use('/calificaciones', CalificacionRoutes);
router.use('/evaluaciones', EvaluacionRoutes);

// ESTADISTICAS
router.use('/dashboard',DashboardRoutes);

export default router;