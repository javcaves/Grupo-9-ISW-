/**
 *@file items.controller.js
 *@description Controlar para items de bodega
 */
//1. IMPORTS
import * as ItemsService from './items.service.js';

//2. HELPER FUNCTIONS
const enviarRespuesta = (res, estado, datos) => {
    const esError = estado >= 400;
    return res.status(estado).json({ [esError ? 'error' : 'datos']: datos });
};

//3. MAIN FUNCTIONS 

//################# CREAR #################
const crearItem = async (req, res) => {
    try {
        const nuevoItem = await ItemsService.crearItem(req.body);
        return enviarRespuesta(res, 201, nuevoItem);
    } catch (error) {
        return enviarRespuesta(res, error.estado || 500, error.message);
    }
};
//################# LEER #################
const listarItems = async (req, res) => {
    try {
        return enviarRespuesta(res, 200, await ItemsService.obtenerTodos());
    } catch (error) {
        return enviarRespuesta(res, 500, "Error al obtener la lista de items");
    }
};

const listarItemsActivos = async (req, res) => {
    try {
        return enviarRespuesta(res, 200, await ItemsService.obtenerActivos());
    } catch (error) {
        return enviarRespuesta(res, 500, "Error al obtener items activos");
    }
};

const listarItemsPorTipo = async (req, res) => {
    try {
        return enviarRespuesta(res, 200, await ItemsService.obtenerPorTipo(parseInt(req.params.id_tipo)));
    } catch (error) {
        return enviarRespuesta(res, 500, "Error al obtener items por tipo");
    }
};

const obtenerItem = async (req, res) => {
    try {
        const item = await ItemsService.obtenerPorId(parseInt(req.params.id));
        if (!item) return enviarRespuesta(res, 404, "Item no encontrado");
        return enviarRespuesta(res, 200, item);
    } catch (error) {
        return enviarRespuesta(res, 500, "Error al obtener el item");
    }
};

//################# ACTUALIZAR  #################
const actualizarItem = async (req, res) => {
    try {
        const itemActualizado = await ItemsService.actualizarItem(parseInt(req.params.id), req.body);
        return enviarRespuesta(res, 200, itemActualizado);
    } catch (error) {
        return enviarRespuesta(res, error.estado || 500, error.message);
    }
};

//################# ELIMINAR  #################
const eliminarItem = async (req, res) => {
    try {
        await ItemsService.eliminarItem(parseInt(req.params.id));
        return enviarRespuesta(res, 200, "Item eliminado (soft delete)");
    } catch (error) {
        return enviarRespuesta(res, error.estado || 500, error.message);
    }
};

const eliminarItemDefinitivo = async (req, res) => {
    try {
        await ItemsService.eliminarItemDefinitivo(parseInt(req.params.id));
        return enviarRespuesta(res, 200, "Item eliminado permanentemente");
    } catch (error) {
        return enviarRespuesta(res, error.estado || 500, error.message);
    }
};
//4. EXPORTS
module.exports = {
    crearItem,
    listarItems,
    listarItemsActivos,
    listarItemsPorTipo,
    obtenerItem,
    actualizarItem,
    eliminarItem,
    eliminarItemDefinitivo
};
