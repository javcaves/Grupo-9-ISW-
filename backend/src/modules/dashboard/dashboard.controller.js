import * as DashboardService from './dashboard.service.js';
import { dashboardFiltrosValidation } from './dashboard.validations.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../../handlers/responseHandlers.js';

/**
 * GET /dashboard/kpis
 */
export const obtenerKPIs = async (req, res) => {
    try {
        const { error, value } = dashboardFiltrosValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, 'error de validacion', error.message);

        const [kpis, err] = await DashboardService.obtenerKPIs(value);
        if (err) return handleErrorClient(res, 400, 'error al obtener kpis', err);

        return handleSuccess(res, 200, 'kpis obtenidos de forma exitosa', kpis);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

/**
 * GET /dashboard/asistencia
 */
export const obtenerAsistenciaSerie = async (req, res) => {
    try {
        const { error, value } = dashboardFiltrosValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, 'error de validacion', error.message);

        const [serie, err] = await DashboardService.obtenerAsistenciaSerie(value);
        if (err) return handleErrorClient(res, 400, 'error al obtener serie de asistencia', err);

        return handleSuccess(res, 200, 'serie de asistencia obtenida de forma exitosa', serie);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

/**
 * GET /dashboard/proyectos/estado
 */
export const obtenerEstadoProyectos = async (req, res) => {
    try {
        const { error, value } = dashboardFiltrosValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, 'error de validacion', error.message);

        const [estado, err] = await DashboardService.obtenerEstadoProyectos(value);
        if (err) return handleErrorClient(res, 400, 'error al obtener estado de proyectos', err);

        return handleSuccess(res, 200, 'estado de proyectos obtenido de forma exitosa', estado);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

/**
 * GET /dashboard/rendimiento
 */
export const obtenerRendimientoPorProyecto = async (req, res) => {
    try {
        const { error, value } = dashboardFiltrosValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, 'error de validacion', error.message);

        const [rendimiento, err] = await DashboardService.obtenerRendimientoPorProyecto(value);
        if (err) return handleErrorClient(res, 400, 'error al obtener rendimiento por proyecto', err);

        return handleSuccess(res, 200, 'rendimiento por proyecto obtenido de forma exitosa', rendimiento);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

/**
 * GET /dashboard/turnos
 */
export const obtenerTurnosPorProyecto = async (req, res) => {
    try {
        const { error, value } = dashboardFiltrosValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, 'error de validacion', error.message);

        const [turnos, err] = await DashboardService.obtenerTurnosPorProyecto(value);
        if (err) return handleErrorClient(res, 400, 'error al obtener turnos por proyecto', err);

        return handleSuccess(res, 200, 'turnos por proyecto obtenidos de forma exitosa', turnos);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

/**
 * GET /dashboard/inventario
 */
export const obtenerInventario = async (req, res) => {
    try {
        const { error, value } = dashboardFiltrosValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, 'error de validacion', error.message);

        const [inventario, err] = await DashboardService.obtenerInventario(value);
        if (err) return handleErrorClient(res, 400, 'error al obtener inventario', err);

        return handleSuccess(res, 200, 'inventario obtenido de forma exitosa', inventario);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

/**
 * GET /dashboard/alertas
 */
export const obtenerAlertas = async (req, res) => {
    try {
        const { error, value } = dashboardFiltrosValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, 'error de validacion', error.message);

        const [alertas, err] = await DashboardService.obtenerAlertas(value);
        if (err) return handleErrorClient(res, 400, 'error al obtener alertas', err);

        return handleSuccess(res, 200, 'alertas obtenidas de forma exitosa', alertas);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};
