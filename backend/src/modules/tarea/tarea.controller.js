import { tareaCreateValidation, tareaUpdateValidation, tareaCancelValidation } from "./tarea.validation.js";
import * as TareaService from "./tarea.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";

// ----- Listar todas las tareas (Global con actividades relacionales) -----
export const listarTareas = async (req, res) => {
    try {
        const lista = await TareaService.obtenerTodas();
        return handleSuccess(res, 200, "Tareas globales obtenidas con éxito", lista);
    } catch (error) { 
        return handleErrorServer(res, 500, "Error al listar tareas globales", error.message); 
    }
};

// Buscar por id
export const obtenerTarea = async (req, res) => {
    try {
        const { id } = req.params;
        const [tarea, err] = await TareaService.obtenerPorId(id);
        if (err) return handleErrorClient(res, 404, "No encontrado", err);
        return handleSuccess(res, 200, "Éxito", tarea);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

// Programar tarea
export const programar = async (req, res) => {
    try {
        const { error, value } = tareaCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const id_programador = req.user.id_usuario; // Extraído del JWT
        
        const [nueva, err] = await TareaService.programarTarea(value, id_programador);
        if (err) return handleErrorClient(res, 400, "Error de negocio", err);
        return handleSuccess(res, 201, "Tarea programada con éxito", nueva);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

// Actualizar
export const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = tareaUpdateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);
        if (Object.keys(value).length === 0) return handleErrorClient(res, 400, "Error", "Debe enviar datos.");

        const [actualizada, err] = await TareaService.actualizarTarea(id, value);
        if (err) return handleErrorClient(res, 400, "Error", err);
        return handleSuccess(res, 200, "Tarea actualizada", actualizada);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

// Eliminar
export const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado, err] = await TareaService.eliminarTarea(id);
        if (err === "ESTADO_EN_PROCESO_NO_ELIMINABLE") {
            return handleErrorClient(res, 409, "Conflicto", "La tarea está en proceso. Debe cancelarla con justificación.");
        }
        if (err) return handleErrorClient(res, 400, "Operación denegada", err);
        
        return handleSuccess(res, 200, "Éxito", resultado);
    } catch (error) { 
        return handleErrorServer(res, 500, "Error", error.message); 
    }
};

// Cancelar 
export const cancelar = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = tareaCancelValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Justificación requerida", error.message);

        const [resultado, err] = await TareaService.cancelarTarea(id, value);
        if (err) return handleErrorClient(res, 400, "No se pudo cancelar", err);
        return handleSuccess(res, 200, "Operación exitosa", resultado);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

// Completar (el empleado marca su propia tarea asignada como realizada)
export const completar = async (req, res) => {
    try {
        const { id } = req.params;
        const idEmpleado = req.user.id_usuario; // Extraído del JWT

        const [resultado, err] = await TareaService.completarTarea(id, idEmpleado);
        if (err) return handleErrorClient(res, 400, "No se pudo completar la tarea", err);
        return handleSuccess(res, 200, "Tarea marcada como completada", resultado);
    } catch (error) { return handleErrorServer(res, 500, "Error al completar la tarea", error.message); }
};

// Empleados disponibles para asignar (según el turno que cubre la fecha/hora de la tarea)
export const obtenerEmpleadosDisponibles = async (req, res) => {
    try {
        const { id } = req.params;
        const [empleados, err] = await TareaService.obtenerEmpleadosDisponibles(id);
        if (err) return handleErrorClient(res, 404, "No encontrado", err);
        return handleSuccess(res, 200, "Empleados disponibles obtenidos", empleados);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

// ----- Mis Tareas (Específicas del empleado autenticado) -----
export async function obtenerMisTareas(req, res) {
    try {
        // Obtenemos el id del usuario desde el JWT middleware (ajustado a req.user.id_usuario)
        const idEmpleado = req.user.id_usuario; 

        if (!idEmpleado) {
            return handleErrorClient(res, 401, "No autorizado", "Identificador de empleado no disponible.");
        }

        const tareas = await TareaService.obtenerMisTareas(idEmpleado);
        return handleSuccess(res, 200, "Tareas del empleado obtenidas con éxito", tareas);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al recuperar las tareas del empleado", error.message);
    }
}