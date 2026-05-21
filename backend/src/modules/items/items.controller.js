/**
 *@file items.controller.js
 *@description Controladorr para items de bodega y movimiento de inventario
 */
//1. IMPORTS
import * as ItemsService from './items.service.js';
import {
    itemCreateValidation,
    itemUpdateValidation,
    movimientoCreateValidation,
    solicitudResolucionValidation,
    actualizarInventarioValidation
} from './items.validation.js';

//2. HELPER FUNCTIONS
export const sendResponse = (res, status, payload) => {
    const isError = status >= 400;
    return res.status(status).json({ [isError ? 'error' : 'data']: payload });
};

//3. MAIN FUNCTIONS 
//################# ITEMS CREAR #################
export const createItem = async (req, res) => {
    try {
        const { error, value } = itemCreateValidation.validate(req.body);
        if (error) return sendResponse(res, 400, error.message);
 
        const [nuevoItem, err] = await ItemsService.crearItem(value);
        if (err) return sendResponse(res, 400, err);
 
        return sendResponse(res, 201, nuevoItem);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

//################# ITEMS LEER #################
export const listarItems = async (req, res) => {
    try {
        const items = await ItemsService.obtenerTodos();
        return sendResponse(res, 200, items);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener la lista de items");
    }
};
 
export const listarItemsActivos = async (req, res) => {
    try {
        const items = await ItemsService.obtenerActivos();
        return sendResponse(res, 200, items);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener items activos");
    }
};
 
export const getItem = async (req, res) => {
    try {
        const [item, err] = await ItemsService.obtenerPorId(parseInt(req.params.id));
        if (err) return sendResponse(res, 404, err);
        return sendResponse(res, 200, item);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener el item");
    }
};

export const updateItem = async (req, res) => {
    try {
        const { error, value } = itemUpdateValidation.validate(req.body);
        if (error) return sendResponse(res, 400, error.message);

        const [itemActualizado, err] = await ItemsService.actualizarItem(parseInt(req.params.id), value);
        if (err) return sendResponse(res, 400, err);

        return sendResponse(res, 200, itemActualizado);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

export const deleteItem = async (req, res) => {
    try {
        const [resultado, err] = await ItemsService.desactivarItem(parseInt(req.params.id));
        if (err) return sendResponse(res, 400, err);
        return sendResponse(res, 200, resultado.message);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

export const registrarMovimiento = async (req, res) => {
    try {
        const { error, value } = movimientoCreateValidation.validate(req.body);
        if (error) return sendResponse(res, 400, error.message);

        const [nuevoMovimiento, err] = await ItemsService.registrarMovimiento(value);
        if (err) return sendResponse(res, 400, err);

        return sendResponse(res, 201, nuevoMovimiento);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

export const resolverSolicitud = async (req, res) => {
    try {
        const { error, value } = solicitudResolucionValidation.validate(req.body);
        if (error) return sendResponse(res, 400, error.message);

        const [resultado, err] = await ItemsService.resolverSolicitud(parseInt(req.params.id_mov), value);
        if (err) return sendResponse(res, 400, err);

        return sendResponse(res, 200, resultado);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

export const auditarInventarioProyecto = async (req, res) => {
    try {
        const { error, value } = actualizarInventarioValidation.validate(req.body);
        if (error) return sendResponse(res, 400, error.message);

        const [resultado, err] = await ItemsService.actualizarInventarioAuditoria(
            parseInt(req.params.id_proyecto),
            value.id_emisor,
            value.items
        );
        if (err) return sendResponse(res, 400, err);

        return sendResponse(res, 200, resultado);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

export const removeMovimiento = async (req, res) => {
    try {
        const [resultado, err] = await ItemsService.eliminarMovimiento(parseInt(req.params.id_mov));
        if (err) return sendResponse(res, 400, err);
        return sendResponse(res, 200, resultado.message);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

export const listarMovimientos = async (req, res) => {
    try {
        const movimientos = await ItemsService.obtenerMovimientos();
        return sendResponse(res, 200, movimientos);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener movimientos");
    }
};

export const listarSolicitudesPendientes = async (req, res) => {
    try {
        const solicitudes = await ItemsService.obtenerSolicitudesPendientes();
        return sendResponse(res, 200, solicitudes);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener solicitudes pendientes");
    }
};

export const listarMovimientosPorItem = async (req, res) => {
    try {
        const movimientos = await ItemsService.obtenerMovimientosPorItem(parseInt(req.params.id));
        return sendResponse(res, 200, movimientos);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener movimientos del item");
    }
};

export const listarBajoStockProyecto = async (req, res) => {
    try {
        const alertas = await ItemsService.obtenerBajoStockPorProyecto(parseInt(req.params.id_proyecto));
        return sendResponse(res, 200, alertas);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener alertas de bajo stock");
    }
};

export const verEstadisticasConsumo = async (req, res) => {
    try {
        const stats = await ItemsService.obtenerEstadisticasConsumo();
        return sendResponse(res, 200, stats);
    } catch (error) {
        return sendResponse(res, 500, "Error al compilar las estadísticas");
    }
};
 
