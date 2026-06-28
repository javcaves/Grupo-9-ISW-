// src/api/asistencia.service.js

import { api } from "./api";

export const AsistenciaService = {
  // ==========================
  // Gestión de asistencia
  // ==========================

  /**
   * Crear una nueva jornada de asistencia.
   * POST /asistencia
   */
  async crear(data) {
    const response = await api.post("/asistencia", data);
    return response.data ?? response;
  },

  /**
   * Obtener la asistencia activa de un turno.
   * GET /asistencia/turno/:id_turno/actual
   */
  async obtenerActual(idTurno) {
    const response = await api.get(`/asistencia/turno/${idTurno}/actual`);
    return response.data ?? response;
  },

  /**
   * Editar el registro de un empleado.
   * PUT /asistencia/:id_asistencia/empleado/:id_empleado
   */
  async editarRegistro(idAsistencia, idEmpleado, data) {
    const response = await api.put(
      `/asistencia/${idAsistencia}/empleado/${idEmpleado}`,
      data
    );

    return response.data ?? response;
  },

  /**
   * Eliminar una jornada completa.
   * DELETE /asistencia/:id_asistencia
   */
  async eliminar(idAsistencia) {
    const response = await api.delete(`/asistencia/${idAsistencia}`);
    return response.data ?? response;
  },

  /**
   * Obtener historial por proyecto.
   * GET /asistencia/proyecto/:id_proyecto/historial
   */
  async historial(idProyecto) {
    const response = await api.get(
      `/asistencia/proyecto/${idProyecto}/historial`
    );

    return response.data ?? response;
  },

  /**
   * Editar un registro histórico.
   * PUT /asistencia/:id_asistencia/empleado/:id_empleado/historial
   */
  async editarHistorial(idAsistencia, idEmpleado, data) {
    const response = await api.put(
      `/asistencia/${idAsistencia}/empleado/${idEmpleado}/historial`,
      data
    );

    return response.data ?? response;
  },

  /**
   * Marcar asistencia mediante QR/Token.
   * POST /asistencia/marcar
   */
  async marcar(data) {
    const response = await api.post("/asistencia/marcar", data);
    return response.data ?? response;
  },

  /**
   * Obtener mi historial de asistencia del proyecto actual.
   * GET /asistencia/proyecto/:id_proyecto/mis-asistencias
   */
  async obtenerMiHistorial(idProyecto) {
      const response = await api.get(
          `/asistencia/proyecto/${idProyecto}/mis-asistencias`
      );

      return response.data ?? response;
  },
  
  /**
   * Obtener mi asistencia del día de hoy filtrada por la ventana horaria de mi turno.
   * GET /asistencia/mi-asistencia?idTurno=X
   */
  async obtenerMiAsistenciaActual(idTurno) {
      // Forzamos la interpolación directa en la URL para asegurar que viaje sin que dependa de la config de Axios
      const response = await api.get(`/asistencia/mi-asistencia-hoy?id_turno=${idTurno}`);
      return response.data ?? response;
    }
};