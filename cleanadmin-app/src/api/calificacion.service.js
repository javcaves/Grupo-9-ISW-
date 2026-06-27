// src/api/calificacion.service.js

import { api } from "./api";

export const CalificacionService = {

  // ==========================
  // CONSULTAS
  // ==========================

  listar(params = {}) {
    return api.get("/calificacion", params);
  },

  obtener(id) {
    return api.get(`/calificacion/${id}`);
  },

  listarPorCategoria(idCategoria) {
    return api.get(`/calificacion/categoria/${idCategoria}`);
  },

  // ==========================
  // ACCIONES
  // ==========================

  otorgar(data) {
    return api.post("/calificacion", data);
  },

  revocar(id) {
    return api.delete(`/calificacion/${id}`);
  },

};