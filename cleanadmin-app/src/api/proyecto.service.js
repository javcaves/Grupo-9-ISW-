// src/api/proyecto.service.js

import { api } from "./api";

const URL = "/proyecto";

export const ProyectoService = {

  // ==================== PROYECTO ====================

  /**
   * Obtiene los proyectos del usuario autenticado.
   */
  async listar() {

    const response = await api.get(URL);

    return response.data;

  },

  /**
   * Obtiene todos los proyectos.
   * Solo ROOT y ADMIN.
   * @param {{incluirInactivos?: boolean}} filtros
   */
  async listarTodos(filtros = {}) {

    const response = await api.get(
      `${URL}/todos`,
      filtros
    );

    return response.data;

  },

  /**
   * Obtiene un proyecto por ID.
   */
  async obtenerPorId(idProyecto) {

    const response = await api.get(
      `${URL}/${idProyecto}`
    );

    return response.data;

  },

  /**
   * Crea un nuevo proyecto.
   */
  async crear(datos) {

    const response = await api.post(
      URL,
      datos
    );

    return response.data;

  },

  /**
   * Actualiza un proyecto.
   */
  async actualizar(idProyecto, datos) {

    const response = await api.put(
      `${URL}/${idProyecto}`,
      datos
    );

    return response.data;

  },

  /**
   * Elimina un proyecto.
   */
  async eliminar(idProyecto) {

    const response = await api.delete(
      `${URL}/${idProyecto}`
    );

    return response.data;

  },

  /**
   * Reactiva un proyecto previamente desactivado.
   */
  async reactivar(idProyecto) {

    const response = await api.patch(
      `${URL}/${idProyecto}/reactivar`
    );

    return response.data;

  },

};