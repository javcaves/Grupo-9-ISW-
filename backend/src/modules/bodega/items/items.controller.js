/**
 *@file items.controller.js
 *@description Controlar para items de bodega
 */
//1. IMPORTS
import * as ItemsService from './items.service.js';

//2. HELPER FUNCTIONS
export const sendResponse = (res, status, payload) => {
    const isError = status >= 400;
    return res.status(status).json({ [isError ? 'error' : 'data']: payload });
};

//3. MAIN FUNCTIONS 
//################# CREAR #################
export const createItem = async (req, res) => {
    try {
        const nuevoItem = await ItemsService.createItem(req.body);
        return sendResponse(res, 201, nuevoItem);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

//################# LEER #################
export const listarItems = async (req, res) => {
    try {
        const items = await ItemsService.getAll();
        return sendResponse(res, 200, items);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener la lista de items");
    }
};

export const listarItemsActivos = async (req, res) => {
    try {
        const items = await ItemsService.getAllActivos();
        return sendResponse(res, 200, items);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener items activos");
    }
};

export const listarItemsPorTipo = async (req, res) => {
    try {
        const items = await ItemsService.getItemsByTipo(parseInt(req.params.id_tipo));
        return sendResponse(res, 200, items);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener items por tipo");
    }
};

export const getItem = async (req, res) => {
    try {
        const item = await ItemsService.getItemById(parseInt(req.params.id));
        if (!item) return sendResponse(res, 404, "Item no encontrado");
        return sendResponse(res, 200, item);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener el item");
    }
};

//################# ACTUALIZAR  #################
export const updateItem = async (req, res) => {
    try {
        const itemActualizado = await ItemsService.updateItem(parseInt(req.params.id), req.body);
        return sendResponse(res, 200, itemActualizado);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

//################# ELIMINAR  #################
export const deleteItem = async (req, res) => {
    try {
        await ItemsService.deleteItem(parseInt(req.params.id));
        return sendResponse(res, 200, "Item eliminado (soft delete)");
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

export const deleteItemHard = async (req, res) => {
    try {
        await ItemsService.deleteItemHard(parseInt(req.params.id));
        return sendResponse(res, 200, "Item eliminado permanentemente");
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};