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

// 3. Main functions (Funciones que exportaremos)

// ################# FUNCIONES DE LECTURA #################

const listarProductos = async (req, res) => {
    try {
        const lista = await InventarioService.getAll();
        return sendResponse(res, 200, lista);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener la lista de productos");
    }
};

const listarProductosActivos = async (req, res) => {
    try {
        const lista = await InventarioService.getAllActivos();
        return sendResponse(res, 200, lista);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener la lista de productos activos");
    }
};

const getProducto = async (req, res) => {
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

const createProducto = async (req, res) => {
    try {
        const data = req.body;
        const nuevoProducto = await InventarioService.createProducto(data);
        return sendResponse(res, 201, nuevoProducto);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

const updateProducto = async (req, res) => {
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

const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        await InventarioService.deleteProducto(parseInt(id));
        return sendResponse(res, 200, "Producto eliminado (soft delete)");
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

const deleteProductoHard = async (req, res) => {
    try {
        const { id } = req.params;
        await InventarioService.deleteProductoHard(parseInt(id));
        return sendResponse(res, 200, "Producto eliminado permanentemente (hard delete)");
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// ################# ASIGNACIÓN DE HERRAMIENTA #################
const updateToolAssignment = async (req, res) => {
    try {
        // Extrae datos de la petición (req)
        const { id } = req.params; // Viene en la URL, ej: /api/bodega/asignar/ENC-001
        const { rutTrabajador } = req.body; // Viene en el JSON que manda el Frontend

        // Validación inicial rápida
        if (!rutTrabajador) {
            return res.status(400).json({ success: false, error: "El RUT del trabajador es obligatorio." });
        }

        // Llama al cerebro (Service) y le pasa objetos de JS
        const resultado = await inventarioService.processToolAssignment(id, rutTrabajador);

        res.status(200).json({ 
            success: true, 
            mensaje: "Herramienta asignada correctamente", 
            data: resultado 
        });
    } catch (error) {
        // Si el Service tira un error (ej. herramienta en uso), cae aquí.
        res.status(400).json({ success: false, error: error.message });
    }
};

// 4. Exports

export default {
    listarProductos,
    listarProductosActivos,
    getProducto,
    createProducto,
    updateProducto,
    deleteProducto,
    deleteProductoHard,
    updateToolAssignment
};