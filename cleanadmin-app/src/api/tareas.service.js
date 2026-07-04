// src/api/tarea.service.js

import { api } from "./api";

const URL = "/tareas";

export const TareaService = {

  // ==================== TAREA ====================

  /**
   * Obtiene todas las tareas globales del sistema (con su actividad asociada).
   * Estructura: array de tareas -> t.actividad.descripcion_esp
   */
  async listar() {
    const response = await api.get(URL);
    // Retornamos directamente los datos para no lidiar con response.data en la vista
    return response.data ?? response;
  },

  /**
   * Obtiene las tareas asignadas específicamente al empleado autenticado.
   * Estructura: array de asignaciones -> a.tarea.actividad.descripcion_esp
   */
  async misTareas() {
    const response = await api.get(`${URL}/mis-tareas`);
    return response.data ?? response;
  },

  /**
   * Obtiene una tarea por su ID.
   */
  async obtenerPorId(idTarea) {
    const response = await api.get(`${URL}/${idTarea}`);
    return response.data ?? response;
  },

  /**
   * Programa una nueva tarea.
   */
  async crear(datos) {
    const response = await api.post(URL, datos);
    return response.data ?? response;
  },

  /**
   * Actualiza una tarea.
   */
  async actualizar(idTarea, datos) {
    const response = await api.put(`${URL}/${idTarea}`, datos);
    return response.data ?? response;
  },

  /**
   * Elimina una tarea.
   */
  async eliminar(idTarea) {
    const response = await api.delete(`${URL}/${idTarea}`);
    return response.data ?? response;
  },

  /**
   * Cancela una tarea con justificación.
   */
  async cancelar(idTarea, comentario) {
    // Cambiado a 'comentario' para hacer match exacto con el validador y modelo del backend
    const response = await api.patch(`${URL}/${idTarea}/cancelar`, {
      comentario,
    });
    return response.data ?? response;
  },

};