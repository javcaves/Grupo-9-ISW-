/**
 * @file inventario.controller.js
 * @description Controlador para el módulo de inventario de la bodega
 */

// 1. Imports (Librerías externas -> Propias)
import * as InventarioService from './inventario.service.js';
import validators from '../../../shared/validators.js';

// 2. Helper functions (Funciones internas no exportadas)
const sendResponse = (res, status, payload) => {
    const isError = status >= 400;
    return res.status(status).json({ [isError ? 'error' : 'data']: payload });
};

// 3. Main functions (Exportadas individualmente)

// ################# FUNCIONES DE LECTURA #################

export const listarProductos = async (req, res) => {
    try {
        const lista = await InventarioService.getAll();
        return sendResponse(res, 200, lista);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener la lista de productos");
    }
};

export const listarProductosActivos = async (req, res) => {
    try {
        const lista = await InventarioService.getAllActivos();
        return sendResponse(res, 200, lista);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener la lista de productos activos");
    }
};

export const getProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await InventarioService.getProductoById(parseInt(id));
        if (!producto) {
            return sendResponse(res, 404, "Producto no encontrado");
        }
        return sendResponse(res, 200, producto);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener el producto");
    }
};

// ################# FUNCIONES DE ESCRITURA #################

export const createProducto = async (req, res) => {
    try {
        const data = req.body;
        const nuevoProducto = await InventarioService.createProducto(data);
        return sendResponse(res, 201, nuevoProducto);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

export const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const productoActualizado = await InventarioService.updateProducto(parseInt(id), data);
        return sendResponse(res, 200, productoActualizado);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// ################# FUNCIONES DE ELIMINACIÓN #################

export const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        await InventarioService.deleteProducto(parseInt(id));
        return sendResponse(res, 200, "Producto eliminado (soft delete)");
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

export const deleteProductoHard = async (req, res) => {
    try {
        const { id } = req.params;
        await InventarioService.deleteProductoHard(parseInt(id));
        return sendResponse(res, 200, "Producto eliminado permanentemente (hard delete)");
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// ################# ASIGNACIÓN DE HERRAMIENTA #################
export const updateToolAssignment = async (req, res) => {
    try {
        // Extrae datos de la petición (req)
        const { id } = req.params; 
        const { rutTrabajador } = req.body; 

        // Validación inicial rápida
        if (!rutTrabajador) {
            return res.status(400).json({ success: false, error: "El RUT del trabajador es obligatorio." });
        }

        // Llama al cerebro (Service)
        const resultado = await InventarioService.processToolAssignment(id, rutTrabajador);

        res.status(200).json({ 
            success: true, 
            mensaje: "Herramienta asignada correctamente", 
            data: resultado 
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};