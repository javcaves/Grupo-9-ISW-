// src/api/asignacion.service.js

import { api } from "./api";

export const AsignacionService = {
  // ==========================
  // Asignaciones
  // ==========================

  /**
   * Obtener todas las asignaciones.
   * GET /asignacion
   */
  async listar() {
    const response = await api.get("/asignacion");
    return response.data ?? response;
  },

  /**
   * Obtener una asignación por ID.
   * GET /asignacion/:id
   */
  async obtener(id) {
    const response = await api.get(`/asignacion/${id}`);
    return response.data ?? response;
  },

  /**
   * Crear una nueva asignación.
   * POST /asignacion
   */
  async crear(data) {
    const response = await api.post("/asignacion", data);
    return response.data ?? response;
  },

  /**
   * Actualizar una asignación.
   * PUT /asignacion/:id
   */
  async actualizar(id, data) {
    const response = await api.put(`/asignacion/${id}`, data);
    return response.data ?? response;
  },

  /**
   * Eliminar una asignación.
   * DELETE /asignacion/:id
   */
  async eliminar(id) {
    const response = await api.delete(`/asignacion/${id}`);
    return response.data ?? response;
  },
};