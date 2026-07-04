// src/api/categoria.service.js

import { api } from "./api";

export const CategoriaService = {

  // ==========================
  // CONSULTAS
  // ==========================

  listar(params = {}) {
    return api.get("/categorias", params);
  },

  obtener(id) {
    return api.get(`/categorias/${id}`);
  },

  // ==========================
  // CRUD
  // ==========================

  crear(data) {
    return api.post("/categorias", data);
  },

  actualizar(id, data) {
    return api.put(`/categorias/${id}`, data);
  },

  eliminar(id) {
    return api.delete(`/categorias/${id}`);
  },

  reactivar(id) {
    return api.patch(`/categorias/${id}/reactivar`);
  },

};