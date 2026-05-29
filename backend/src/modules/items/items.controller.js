/**
 *@file items.controller.js
 *@description Controlador para items de bodega y movimiento de inventario
 */

// 1. IMPORTS
import * as ItemsService from './items.service.js';
import {
    itemCreateValidation,
    itemUpdateValidation,
    movimientoCreateValidation,
    solicitudResolucionValidation,
    actualizarInventarioValidation
} from './items.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js"; // IMPORTANTE: Ajustar ruta según tu estructura de carpetas

// ================= ITEMS - CREAR =================

export const createItem = async (req, res) => {
    try {
        const { error, value } = itemCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);
 
        const [nuevoItem, err] = await ItemsService.crearItem(value);
        if (err) return handleErrorClient(res, 400, "Error de validación de negocio", err);
 
        return handleSuccess(res, 201, "Item creado con éxito", nuevoItem);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

// ================= ITEMS - LEER =================

export const listarItems = async (req, res) => {
    try {
        const items = await ItemsService.obtenerTodos();
        return handleSuccess(res, 200, "Catálogo de items obtenido", items);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener la lista de items", error.message);
    }
};
 
export const listarItemsActivos = async (req, res) => {
    try {
        const items = await ItemsService.obtenerActivos();
        return handleSuccess(res, 200, "Items activos obtenidos", items);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener items activos", error.message);
    }
};
 
export const getItem = async (req, res) => {
    try {
        const [item, err] = await ItemsService.obtenerPorId(parseInt(req.params.id));
        if (err) return handleErrorClient(res, 404, "No encontrado", err);
        return handleSuccess(res, 200, "Item obtenido", item);
    } catch (error) {
        return handleErrorServer(res, 500, "Error interno", error.message);
    }
};

// ================= ITEMS - ACTUALIZAR =================

export const updateItem = async (req, res) => {
    try {
        const { error, value } = itemUpdateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        // Validación de la plantilla: Verificar si se envió un objeto vacío
        if (Object.keys(value).length === 0) {
            return handleErrorClient(res, 400, "Error", "Debe enviar al menos un campo para actualizar");
        }

        const [itemActualizado, err] = await ItemsService.actualizarItem(parseInt(req.params.id), value);
        if (err) return handleErrorClient(res, 400, "No se pudo actualizar", err);

        return handleSuccess(res, 200, "Item actualizado", itemActualizado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

// ================= ITEMS - ELIMINAR =================

export const deleteItem = async (req, res) => {
    try {
        const [resultado, err] = await ItemsService.desactivarItem(parseInt(req.params.id));
        if (err) return handleErrorClient(res, 400, "Operación denegada", err);
        
        return handleSuccess(res, 200, "Operación exitosa", resultado.message);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

// ================= MOVIMIENTOS E INVENTARIO =================

export const registrarMovimiento = async (req, res) => {
    try {
        const { error, value } = movimientoCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const [nuevoMovimiento, err] = await ItemsService.registrarMovimiento(value);
        if (err) return handleErrorClient(res, 400, "Error en el registro del movimiento", err);

        return handleSuccess(res, 201, "Movimiento registrado con éxito", nuevoMovimiento);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

export const resolverSolicitud = async (req, res) => {
    try {
        const { error, value } = solicitudResolucionValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const [resultado, err] = await ItemsService.resolverSolicitud(parseInt(req.params.id_mov), value);
        if (err) return handleErrorClient(res, 400, "No se pudo resolver la solicitud", err);

        return handleSuccess(res, 200, "Solicitud resuelta", resultado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

export const auditarInventarioProyecto = async (req, res) => {
    try {
        const { error, value } = actualizarInventarioValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const [resultado, err] = await ItemsService.actualizarInventarioAuditoria(
            parseInt(req.params.id_proyecto),
            value.id_emisor,
            value.items
        );
        if (err) return handleErrorClient(res, 400, "Fallo en la auditoría", err);

        return handleSuccess(res, 200, "Inventario auditado", resultado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

export const removeMovimiento = async (req, res) => {
    try {
        const [resultado, err] = await ItemsService.eliminarMovimiento(parseInt(req.params.id_mov));
        if (err) return handleErrorClient(res, 400, "Operación denegada", err);
        
        return handleSuccess(res, 200, "Operación exitosa", resultado.message);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

export const listarMovimientos = async (req, res) => {
    try {
        const movimientos = await ItemsService.obtenerMovimientos();
        return handleSuccess(res, 200, "Lista de movimientos obtenida", movimientos);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener movimientos", error.message);
    }
};

export const listarSolicitudesPendientes = async (req, res) => {
    try {
        const solicitudes = await ItemsService.obtenerSolicitudesPendientes();
        return handleSuccess(res, 200, "Solicitudes pendientes obtenidas", solicitudes);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener solicitudes", error.message);
    }
};

export const listarMovimientosPorItem = async (req, res) => {
    try {
        const movimientos = await ItemsService.obtenerMovimientosPorItem(parseInt(req.params.id));
        return handleSuccess(res, 200, "Movimientos del item obtenidos", movimientos);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener movimientos del item", error.message);
    }
};

export const listarBajoStockProyecto = async (req, res) => {
    try {
        const alertas = await ItemsService.obtenerBajoStockPorProyecto(parseInt(req.params.id_proyecto));
        return handleSuccess(res, 200, "Alertas de bajo stock obtenidas", alertas);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener alertas", error.message);
    }
};

export const verEstadisticasConsumo = async (req, res) => {
    try {
        const stats = await ItemsService.obtenerEstadisticasConsumo();
        return handleSuccess(res, 200, "Estadísticas compiladas", stats);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al compilar las estadísticas", error.message);
    }
};