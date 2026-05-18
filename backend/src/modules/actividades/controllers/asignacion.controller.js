import { asignacionCreateValidation, asignacionUpdateValidation } from "../validations/asignacion.validation.js";
import * as AsignacionService from "../services/asignacion.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

// Listar ----
export const listarAsignaciones = async (req, res) => {
    try {
        const lista = await AsignacionService.obtenerTodas();
        return handleSuccess(res, 200, "Asignaciones obtenidas", lista);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

export const obtenerAsignacion = async (req, res) => {
    try {
        const { id } = req.params;
        const [asignacion, err] = await AsignacionService.obtenerPorId(id);
        if (err) return handleErrorClient(res, 404, "No encontrado", err);
        return handleSuccess(res, 200, "Éxito", asignacion);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

export const crearAsignacion = async (req, res) => {
    try {
        const { error, value } = asignacionCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const id_asignador = req.user.id;
        
        const [nueva, err] = await AsignacionService.asignarTarea(value, id_asignador);
        if (err) return handleErrorClient(res, 400, "Error de validación", err);
        return handleSuccess(res, 201, "Tarea asignada con éxito", nueva);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

export const actualizarAsignacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = asignacionUpdateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);
        
        if (Object.keys(value).length === 0) return handleErrorClient(res, 400, "Error", "Debe enviar datos.");

        const [actualizada, err] = await AsignacionService.actualizarAsignacion(id, value);
        if (err) return handleErrorClient(res, 400, "Error", err);
        return handleSuccess(res, 200, "Asignación actualizada", actualizada);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

export const eliminarAsignacion = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado, err] = await AsignacionService.eliminarAsignacion(id);
        if (err) return handleErrorClient(res, 400, "Denegado", err);
        return handleSuccess(res, 200, "Éxito", resultado);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};