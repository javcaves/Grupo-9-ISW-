import * as NotificacionService from './notificacion.service.js';
import { notificacionIdValidation, notificacionQueryValidation } from './notificacion.validations.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";

/**
 * 1. Listar notificaciones propias
 * GET /notificaciones
 */
export const obtenerMisNotificaciones = async (req, res) => {
    try {
        const { error, value } = notificacionQueryValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, 'error de validacion', error.message);

        const [notificaciones, err] = await NotificacionService.obtenerMisNotificaciones(req.user, value);
        if (err) return handleErrorClient(res, 500, 'error al obtener notificaciones', err);

        return handleSuccess(res, 200, 'notificaciones obtenidas de forma exitosa', notificaciones);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

/**
 * 2. Marcar una notificacion como leida
 * PUT /notificaciones/:id_notificacion/leido
 */
export const marcarLeida = async (req, res) => {
    try {
        const { error, value } = notificacionIdValidation.validate(req.params);
        if (error) return handleErrorClient(res, 400, 'error de validacion', error.message);

        const [actualizada, err] = await NotificacionService.marcarLeida(value.id_notificacion, req.user);
        if (err) return handleErrorClient(res, 400, 'error al marcar notificacion', err);

        return handleSuccess(res, 200, 'notificacion marcada como leida', actualizada);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

/**
 * 3. Marcar todas las notificaciones propias como leidas
 * PUT /notificaciones/leido-todas
 */
export const marcarTodasLeidas = async (req, res) => {
    try {
        const [resultado, err] = await NotificacionService.marcarTodasLeidas(req.user);
        if (err) return handleErrorClient(res, 400, 'error al marcar notificaciones', err);

        return handleSuccess(res, 200, 'notificaciones marcadas como leidas', resultado);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};
