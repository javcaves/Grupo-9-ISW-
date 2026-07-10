// src/api/items.service.js

import { api } from "./api";

export const ItemsService = {

  // ==========================
  // ITEMS
  // ==========================

  listar(params = {}) {
    return api.get("/items", params);
  },

  listarPorProyecto(idProyecto) {
    return api.get(`/items/proyecto/${idProyecto}`);
  },

  listarActivos() {
    return api.get("/items/activos");
  },

  obtener(id) {
    return api.get(`/items/${id}`);
  },

  crear(data) {
    return api.post("/items", data);
  },

  actualizar(id, data) {
    return api.put(`/items/${id}`, data);
  },

  eliminar(id) {
    return api.delete(`/items/${id}`);
  },

  // ==========================
  // MOVIMIENTOS
  // ==========================

  listarMovimientos(params = {}) {
    return api.get("/items/movimientos", params);
  },

  listarMovimientosPorItem(id) {
    return api.get(`/items/${id}/movimientos`);
  },

  registrarMovimiento(data) {
    return api.post("/items/movimientos", data);
  },

  eliminarMovimiento(idMovimiento) {
    return api.delete(`/items/movimientos/${idMovimiento}`);
  },

  // ==========================
  // SOLICITUDES
  // ==========================

  listarSolicitudesPendientes() {
    return api.get("/items/movimientos/solicitudes");
  },

  resolverSolicitud(idMovimiento, data) {
    return api.patch(`/items/movimientos/${idMovimiento}/resolver`, data);
  },

  // ==========================
  // INVENTARIO
  // ==========================

  auditarInventario(idProyecto, data) {
    return api.put(
      `/items/proyecto/${idProyecto}/auditar`,
      data
    );
  },

  listarBajoStock(idProyecto) {
    return api.get(
      `/items/proyecto/${idProyecto}/bajo-stock`
    );
  },

  listarBajoStockGlobal() {
    return api.get("/items/bajo-stock");
  },

  vincularProyecto(idProyecto, data) {
    return api.post(`/items/proyecto/${idProyecto}/vincular`, data);
  },

  desvincularProyecto(idProyecto, idItem) {
    return api.delete(`/items/proyecto/${idProyecto}/item/${idItem}`);
  },

  // ==========================
  // ESTADÍSTICAS
  // ==========================

  estadisticasConsumo() {
    return api.get("/items/stats/consumo");
  },

};
