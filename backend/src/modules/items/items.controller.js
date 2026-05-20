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
    solicitudResolucionValidation
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
 
export const listarItemsPorTipo = async (req, res) => {
    try {
        const items = await ItemsService.obtenerPorTipo(req.params.tipo);
        return sendResponse(res, 200, items);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener items por tipo");
    }
};
 
export const listarBajoStock = async (req, res) => {
    try {
        const items = await ItemsService.obtenerBajoStock();
        return sendResponse(res, 200, items);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener items con bajo stock");
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

//################# ITEMS ACTUALIZAR  #################
export const updateItem = async (req, res) => {
    try {
        const { error, value } = itemUpdateValidation.validate(req.body);
        if (error) return sendResponse(res, 400, error.message);
 
        if (Object.keys(value).length === 0)
            return sendResponse(res, 400, "Debe enviar al menos un campo para actualizar");
 
        const [itemActualizado, err] = await ItemsService.actualizarItem(parseInt(req.params.id), value);
        if (err) return sendResponse(res, 400, err);
 
        return sendResponse(res, 200, itemActualizado);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

//################# ITEMS ELIMINAR  #################
export const deleteItem = async (req, res) => {
    try {
        const [resultado, err] = await ItemsService.desactivarItem(parseInt(req.params.id));
        if (err) return sendResponse(res, 400, err);
        return sendResponse(res, 200, resultado.message);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

//################# MOVIMIENTOS LEER  #################
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
 
export const obtenerMovimiento = async (req, res) => {
    try {
        const [mov, err] = await ItemsService.obtenerMovimientoPorId(parseInt(req.params.id_mov));
        if (err) return sendResponse(res, 404, err);
        return sendResponse(res, 200, mov);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener el movimiento");
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
 
// ################# MOVIMIENTOS - RESOLVER SOLICITUD #################
 
export const resolverSolicitud = async (req, res) => {
    try {
        const { error, value } = solicitudResolucionValidation.validate(req.body);
        if (error) return sendResponse(res, 400, error.message);
 
        const [resultado, err] = await ItemsService.resolverSolicitud(
            parseInt(req.params.id_mov),
            value.decision
        );
        if (err) return sendResponse(res, 400, err);
 
        return sendResponse(res, 200, resultado);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

