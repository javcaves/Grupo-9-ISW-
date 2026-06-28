// src/api/tarea.service.js

import { api } from "./api";

const URL = "/tareas";

export const TareaService = {

  // ==================== TAREA ====================

  /**
   * Obtiene todas las tareas.
   */
  async listar() {

    const response = await api.get(URL);

    return response;

  },

  async misTareas() {

    return await api.get(`${URL}/mis-tareas`);

  },
  /**
   * Obtiene una tarea por su ID.
   */
  async obtenerPorId(idTarea) {

    const response = await api.get(
      `${URL}/${idTarea}`
    );

    return response;

  },

  /**
   * Programa una nueva tarea.
   */
  async crear(datos) {

    const response = await api.post(
      URL,
      datos
    );

    return response;

  },

  /**
   * Actualiza una tarea.
   */
  async actualizar(idTarea, datos) {

    const response = await api.put(
      `${URL}/${idTarea}`,
      datos
    );

    return response;

  },

  /**
   * Elimina una tarea.
   */
  async eliminar(idTarea) {

    const response = await api.delete(
      `${URL}/${idTarea}`
    );

    return response;

  },

  /**
   * Cancela una tarea con justificación.
   */
  async cancelar(idTarea, justificacion) {

    const response = await api.patch(
      `${URL}/${idTarea}/cancelar`,
      {
        justificacion,
      }
    );

    return response;

  },

};