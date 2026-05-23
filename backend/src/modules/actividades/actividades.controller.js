import { actividadCreateValidation, actividadUpdateValidation, actividadQueryValidation, actividadRecurrenciaValidation} from "./actividades.validation.js";
import * as ActividadesService from "./actividades.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";

// ----- Listar -----

export const listarCatalogo = async (req, res) => {
    try {
        const lista = await ActividadesService.obtenerTodosActivos();
        return handleSuccess(res, 200, "Catálogo de actividades obtenido", lista);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener el catálogo de actividades", error.message);
    }
};

// la busca por el ID
export const obtenerActividad = async (req, res) => {
    try {
        const { id } = req.params;
        const [actividad, err] = await ActividadesService.obtenerPorID(id);
        if (err) return handleErrorClient(res, 404, "No encontrado", err);
        return handleSuccess(res, 200, "Actividad obtenida", actividad);
    } catch (error) {
        return handleErrorServer(res, 500, "Error interno", error.message);
    }
};

// La busca por tarea
export const buscarActividades = async (req, res) => {
    try {
        const { error, value } = actividadQueryValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, "Error en la búsqueda", error.message);

        const resultados = await ActividadesService.buscarDinamico(value.q);
        return handleSuccess(res, 200, "Resultados de búsqueda", resultados);
    } catch (error) {
        return handleErrorServer(res, 500, "Error interno", error.message);
    }
};

// Busca por categoria
export const filtrarPorCategoria = async (req, res) => {
    try {
        const { id_cat } = req.params;
        const [lista, err] = await ActividadesService.obtenerPorCategoria(id_cat);
        
        if (err) return handleErrorClient(res, 404, "No encontrado", err);
        return handleSuccess(res, 200, "Actividades filtradas por categoría", lista);
    } catch (error) {
        return handleErrorServer(res, 500, "Error interno", error.message);
    }
};

// Busca por recurrencia
export const filtrarPorRecurrencia = async (req, res) => {
    try {
        const { tipo } = req.params;
        
        // Usamos Joi para validar que el parámetro (tipo) de la URL sea válido
        const { error, value } = actividadRecurrenciaValidation.validate({ tipo: tipo.toUpperCase() });
        if (error) return handleErrorClient(res, 400, "Parámetro inválido", error.message);

        const [lista, err] = await ActividadesService.obtenerPorRecurrencia(value.tipo);
        
        if (err) return handleErrorClient(res, 404, "No encontrado", err);
        return handleSuccess(res, 200, "Actividades filtradas por periodicidad", lista);
    } catch (error) {
        return handleErrorServer(res, 500, "Error interno", error.message);
    }
};

// ----- Registro -----

export const registrarEnCatalogo = async (req, res) => {
    try {
        const { error, value } = actividadCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const [nueva, err] = await ActividadesService.crearActividad(value);
        
        if (err) return handleErrorClient(res, 400, "Error de validación de negocio", err);
        return handleSuccess(res, 201, "Actividad creada con éxito", nueva);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

// ----- Actualizacion -----

export const actualizarActividadController = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = actividadUpdateValidation.validate(req.body);

        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);
        
        if (Object.keys(value).length === 0) {
            return handleErrorClient(res, 400, "Error", "Debe enviar al menos un campo para actualizar");
        }

        const [actualizada, err] = await ActividadesService.actualizarActividad(id, value);
        
        if (err) return handleErrorClient(res, 400, "No se pudo actualizar", err);
        return handleSuccess(res, 200, "Actividad actualizada", actualizada);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

// ----- Eliminacion -----

export const eliminarDelCatalogo = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado, err] = await ActividadesService.eliminarDelCatalogo(id);

        if (err) return handleErrorClient(res, 400, "Operación denegada", err);
        return handleSuccess(res, 200, "Operación exitosa", resultado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};