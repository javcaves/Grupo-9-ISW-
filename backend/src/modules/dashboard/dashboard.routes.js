import { Router } from 'express';
import * as DashboardController from './dashboard.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();

// Todo el dashboard es exclusivo para administradores del sistema
router.use(authenticateJwt, checkRole(['ROOT', 'ADMIN','SUPERVISOR']));

/**
 * KPIs generales: proyectos activos, empleados, % asistencia,
 * % tareas, stock bajo, cantidad de alertas
 */
router.get('/kpis', DashboardController.obtenerKPIs);

/**
 * Serie diaria de % de asistencia (para el gráfico de líneas)
 */
router.get('/asistencia', DashboardController.obtenerAsistenciaSerie);

/**
 * Distribución de proyectos por estado (para el gráfico de dona)
 */
router.get('/proyectos/estado', DashboardController.obtenerEstadoProyectos);

/**
 * % asistencia + % tareas por proyecto (para las barras horizontales)
 */
router.get('/rendimiento', DashboardController.obtenerRendimientoPorProyecto);

/**
 * Turnos generados vs completados por proyecto (para las barras
 * horizontales de "Proyectos y Turnos")
 */
router.get('/turnos', DashboardController.obtenerTurnosPorProyecto);

/**
 * Stock crítico, solicitudes pendientes y consumo mensual
 */
router.get('/inventario', DashboardController.obtenerInventario);

/**
 * Alertas calculadas: asistencia baja, tareas vencidas, stock crítico,
 * proyectos con 100% de tareas completadas
 */
router.get('/alertas', DashboardController.obtenerAlertas);

export default router;
