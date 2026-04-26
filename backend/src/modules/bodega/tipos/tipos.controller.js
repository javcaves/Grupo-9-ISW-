/**
 * @file tipos.controller.js
 * @description Controlador para el módulo de tipos
 */

// 1. Imports
import * as TiposService from './tipos.service.js';

// 2. Helper functions
const sendResponse = (res, status, payload) => {
    const isError = status >= 400;
    return res.status(status).json({ [isError ? 'error' : 'data']: payload });
};

// 3. Main functions

// ################# FUNCIONES DE LECTURA #################

const listarTipos = async (req, res) => {
    try {
        const lista = await TiposService.getAll();
        return sendResponse(res, 200, lista);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener la lista de tipos");
    }
};

const listarTiposActivos = async (req, res) => {
    try {
        const lista = await TiposService.getAllActivos();
        return sendResponse(res, 200, lista);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener la lista de tipos activos");
    }
};

const getTipo = async (req, res) => {
    try {
        const { id } = req.params;
        const tipo = await TiposService.getTipoById(parseInt(id));
        if (!tipo) return sendResponse(res, 404, "Tipo no encontrado");
        return sendResponse(res, 200, tipo);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener el tipo");
    }
};

// ################# FUNCIONES DE ESCRITURA #################

const createTipo = async (req, res) => {
    try {
        const nuevoTipo = await TiposService.createTipo(req.body);
        return sendResponse(res, 201, nuevoTipo);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

const updateTipo = async (req, res) => {
    try {
        const { id } = req.params;
        const tipoActualizado = await TiposService.updateTipo(parseInt(id), req.body);
        return sendResponse(res, 200, tipoActualizado);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// ################# FUNCIONES DE ELIMINACIÓN #################

const deleteTipo = async (req, res) => {
    try {
        const { id } = req.params;
        await TiposService.deleteTipo(parseInt(id));
        return sendResponse(res, 200, "Tipo eliminado (soft delete)");
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

const deleteTipoHard = async (req, res) => {
    try {
        const { id } = req.params;
        await TiposService.deleteTipoHard(parseInt(id));
        return sendResponse(res, 200, "Tipo eliminado permanentemente (hard delete)");
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// 4. Exports
module.exports = {
    listarTipos,
    listarTiposActivos,
    getTipo,
    createTipo,
    updateTipo,
    deleteTipo,
    deleteTipoHard
};
