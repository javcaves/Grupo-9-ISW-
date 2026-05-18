import { calificacionCreateValidation } from "../validations/calificacion.validation.js";
import * as CalificacionService from "../services/calificacion.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export const listarCalificaciones = async (req, res) => {
    try {
        const lista = await CalificacionService.obtenerTodas();
        return handleSuccess(res, 200, "Calificaciones obtenidas", lista);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

export const obtenerCalificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const [calificacion, err] = await CalificacionService.obtenerPorId(id);
        if (err) return handleErrorClient(res, 404, "No encontrado", err);
        return handleSuccess(res, 200, "Éxito", calificacion);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

export const otorgar = async (req, res) => {
    try {
        const { error, value } = calificacionCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const id_otorga = req.user.id;
        
        const [nueva, err] = await CalificacionService.otorgarCalificacion(value, id_otorga);
        if (err) return handleErrorClient(res, 400, "Error de negocio", err);
        return handleSuccess(res, 201, "Calificación otorgada", nueva);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

export const revocar = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado, err] = await CalificacionService.revocarCalificacion(id);
        if (err) return handleErrorClient(res, 400, "Denegado", err);
        return handleSuccess(res, 200, "Éxito", resultado);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};