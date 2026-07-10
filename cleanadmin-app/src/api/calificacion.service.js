// src/api/calificacion.service.js

import { api } from "./api";

export const CalificacionService = {

  // ==========================
  // CONSULTAS
  // ==========================

  listar(params = {}) {
    return api.get("/calificaciones", params);
  },

  obtener(id) {
    return api.get(`/calificaciones/${id}`);
  },

  listarPorCategoria(idCategoria) {
    return api.get(`/calificaciones/categoria/${idCategoria}`);
  },

  // ==========================
  // ACCIONES
  // ==========================

  otorgar(data) {
    return api.post("/calificaciones", data);
  },

  revocar(id) {
    return api.delete(`/calificaciones/${id}`);
  },

};