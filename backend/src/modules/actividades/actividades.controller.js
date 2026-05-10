import * as ActividadesService from './actividades.service.js';

const sendResponse = (res, status, payload) => {
    const isError = status >= 400;
    return res.status(status).json({ [isError ? 'error' : 'data']: payload });
};

// ----- Listar -----

export const listarCatalogo = async (req, res) => {
    try {
        const lista = await ActividadesService.obtenerTodosActivos();
        return sendResponse(res, 200, lista);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener el catálogo de actividades");
    }
};

// la busca por el ID
export const obtenerActividad = async (req, res) => {
    try {
        const { id } = req.params;
        const actividad = await ActividadesService.obtenerPorID(id);
        return sendResponse(res, 200, actividad);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};
// La busca por tarea
export const buscarActividades = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return sendResponse(res, 400, "Se requiere un término de búsqueda (q)");

        const resultados = await ActividadesService.buscarDinamico(q);
        return sendResponse(res, 200, resultados);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

// ----- Registro -----

export const registrarEnCatalogo = async (req, res) => {
    try {
        const nueva = await ActividadesService.crearActividad(req.body);
        return sendResponse(res, 201, nueva);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// ----- Actualizacion -----

export const actualizarActividad = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizada = await ActividadesService.actualizar(id, req.body);
        return sendResponse(res, 200, actualizada);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// ----- Eliminacion -----

export const eliminarDelCatalogo = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await ActividadesService.eliminar({ id });
        return sendResponse(res, 200, resultado.message);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

export const borrarActividadDefinitivamente = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await ActividadesService.ELIMINARHARD({ id });
        return sendResponse(res, 200, resultado.message);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};