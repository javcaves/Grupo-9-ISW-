import { evaluacionCreateValidation } from "./evaluacion.validation.js";
import * as EvaluacionService from "./evaluacion.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";

// ----- Crear -----
export const crear = async (req, res) => {
    try {
        const { error, value } = evaluacionCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const id_evaluador = req.user.id_usuario;

        const [nueva, err] = await EvaluacionService.crearEvaluacion(value, id_evaluador);
        if (err) return handleErrorClient(res, 400, "Error de negocio", err);
        return handleSuccess(res, 201, "Evaluación registrada con éxito", nueva);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

// ----- Hoja de vida de un empleado -----
export const listarPorEmpleado = async (req, res) => {
    try {
        const { id_empleado } = req.params;
        const lista = await EvaluacionService.obtenerPorEmpleado(id_empleado);
        return handleSuccess(res, 200, "Hoja de vida obtenida", lista);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

// ----- Evaluaciones de una tarea -----
export const listarPorTarea = async (req, res) => {
    try {
        const { id_tarea } = req.params;
        const lista = await EvaluacionService.obtenerPorTarea(id_tarea);
        return handleSuccess(res, 200, "Evaluaciones de la tarea obtenidas", lista);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

// ----- Revocar -----
export const revocar = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado, err] = await EvaluacionService.revocarEvaluacion(id);
        if (err) return handleErrorClient(res, 400, "Denegado", err);
        return handleSuccess(res, 200, "Éxito", resultado);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};
