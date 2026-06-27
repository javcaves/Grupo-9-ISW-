// src/api/actividades.service.js

import { api } from "./api";

export const ActividadesService = {
  // ==========================
  // Catálogo de actividades
  // ==========================

  /**
   * Obtener todo el catálogo de actividades.
   * GET /actividades
   */
  async listar() {
    const response = await api.get("/actividades");
    return response.data ?? response;
  },

  /**
   * Obtener una actividad por ID.
   * GET /actividades/:id
   */
  async obtener(id) {
    const response = await api.get(`/actividades/${id}`);
    return response.data ?? response;
  },

  /**
   * Buscar actividades por nombre.
   * GET /actividades/buscar?q=...
   */
  async buscar(q) {
    const response = await api.get("/actividades/buscar", { q });
    return response.data ?? response;
  },

  /**
   * Obtener actividades por categoría.
   * GET /actividades/categoria/:id_cat
   */
  async listarPorCategoria(idCategoria) {
    const response = await api.get(
      `/actividades/categoria/${idCategoria}`
    );

    return response.data ?? response;
  },

  /**
   * Obtener actividades por recurrencia.
   * DIARIA | SEMANAL | MENSUAL | etc.
   *
   * GET /actividades/recurrencia/:tipo
   */
  async listarPorRecurrencia(tipo) {
    const response = await api.get(
      `/actividades/recurrencia/${tipo}`
    );

    return response.data ?? response;
  },

  /**
   * Registrar una actividad en el catálogo.
   * POST /actividades/registrar
   */
  async crear(data) {
    const response = await api.post(
      "/actividades/registrar",
      data
    );

    return response.data ?? response;
  },

  /**
   * Actualizar una actividad.
   * PUT /actividades/:id
   */
  async actualizar(id, data) {
    const response = await api.put(
      `/actividades/${id}`,
      data
    );

    return response.data ?? response;
  },

  /**
   * Eliminar (Soft Delete) una actividad.
   * DELETE /actividades/:id
   */
  async eliminar(id) {
    const response = await api.delete(
      `/actividades/${id}`
    );

    return response.data ?? response;
  },
};