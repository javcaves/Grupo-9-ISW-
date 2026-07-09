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
   * Obtiene los empleados que están disponibles (según el turno vigente
   * para la fecha/hora de la tarea) para ser asignados a esta tarea.
   */
  async obtenerEmpleadosDisponibles(idTarea) {
    const response = await api.get(`${URL}/${idTarea}/empleados-disponibles`);
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
  async cancelar(idTarea, payload) {
    // Cambiado a 'comentario' para hacer match exacto con el validador y modelo del backend
    const response = await api.patch(`${URL}/${idTarea}/cancelar`,payload);
    return response.data ?? response;
  },

  /**
   * Marca como completada (FINALIZADA) una tarea asignada al empleado
   * autenticado. El backend valida que la asignación vigente le pertenezca.
   */
  async completar(idTarea) {
    const response = await api.patch(`${URL}/${idTarea}/completar`);
    return response.data ?? response;
  },

};