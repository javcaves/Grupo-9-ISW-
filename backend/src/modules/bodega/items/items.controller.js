/**
 *@file items.controller.js
 *@description Controlar para items de bodega
 */
//1. IMPORTS
import * as ItemsService from './items.service.js';

//2. HELPER FUNCTIONS
const sendResponse = (res, status, payload) => {
    const isError = status >= 400;
    return res.status(status).json({ [isError ? 'error' : 'data']: payload });
};

//3. MAIN FUNCTIONS 
//################# CREAR #################
const createItem = async (req, res) => {
    try {
        const nuevoItem = await ItemsService.createItem(req.body);
        return sendResponse(res, 201, nuevoItem);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};
//################# LEER #################
const listarItems = async (req, res) => {
    try {
        return sendResponse(res, 200, await ItemsService.getAll());
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener la lista de items");
    }
};

const listarItemsActivos = async (req, res) => {
    try {
        return sendResponse(res, 200, await ItemsService.getAllActivos());
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener items activos");
    }
};

const listarItemsPorTipo = async (req, res) => {
    try {
        return sendResponse(res, 200, await ItemsService.getItemsByTipo(parseInt(req.params.id_tipo)));
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener items por tipo");
    }
};

const getItem = async (req, res) => {
    try {
        const item = await ItemsService.getItemById(parseInt(req.params.id));
        if (!item) return sendResponse(res, 404, "Item no encontrado");
        return sendResponse(res, 200, item);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener el item");
    }
};
//################# ACTUALIZAR  #################
const updateItem = async (req, res) => {
    try {
        const itemActualizado = await ItemsService.updateItem(parseInt(req.params.id), req.body);
        return sendResponse(res, 200, itemActualizado);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};
//################# ELIMINAR  #################
const deleteItem = async (req, res) => {
    try {
        await ItemsService.deleteItem(parseInt(req.params.id));
        return sendResponse(res, 200, "Item eliminado (soft delete)");
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

const deleteItemHard = async (req, res) => {
    try {
        await ItemsService.deleteItemHard(parseInt(req.params.id));
        return sendResponse(res, 200, "Item eliminado permanentemente");
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};
//4. EXPORTS
module.exports = {
    createItem,
    listarItems,
    listarItemsActivos,
    listarItemsPorTipo,
    getItem,
    updateItem,
    deleteItem,
    deleteItemHard
};
