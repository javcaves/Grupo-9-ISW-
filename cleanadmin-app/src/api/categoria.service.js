// src/api/categoria.service.js

import { api } from "./api";

export const CategoriaService = {

  // ==========================
  // CONSULTAS
  // ==========================

  listar(params = {}) {
    return api.get("/categoria", params);
  },

  obtener(id) {
    return api.get(`/categoria/${id}`);
  },

  // ==========================
  // CRUD
  // ==========================

  crear(data) {
    return api.post("/categoria", data);
  },

  actualizar(id, data) {
    return api.put(`/categoria/${id}`, data);
  },

  eliminar(id) {
    return api.delete(`/categoria/${id}`);
  },

  reactivar(id) {
    return api.patch(`/categoria/${id}/reactivar`);
  },

};