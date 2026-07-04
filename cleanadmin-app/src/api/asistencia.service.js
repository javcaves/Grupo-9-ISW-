// src/api/asistencia.service.js
import { api } from "./api";

export const AsistenciaService = {

  /** POST /asistencia */
  async crear(data) {
    const response = await api.post("/asistencia", data);
    return response.data ?? response;
  },

  /** GET /asistencia/turno/:id_turno/actual */
  async obtenerActual(idTurno) {
    const response = await api.get(`/asistencia/turno/${idTurno}/actual`);
    return response.data ?? response;
  },

  /** PUT /asistencia/:id_asistencia/empleado/:id_empleado */
  async editarRegistro(idAsistencia, idEmpleado, data) {
    const response = await api.put(
      `/asistencia/${idAsistencia}/empleado/${idEmpleado}`,
      data
    );
    return response.data ?? response;
  },

  /** DELETE /asistencia/:id_asistencia */
  async eliminar(idAsistencia) {
    const response = await api.delete(`/asistencia/${idAsistencia}`);
    return response.data ?? response;
  },

  /** PATCH /asistencia/:id_asistencia/finalizar */
  async finalizar(idAsistencia) {
    const response = await api.patch(`/asistencia/${idAsistencia}/finalizar`);
    return response.data ?? response;
  },

  /** GET /asistencia/proyecto/:id_proyecto/historial */
  async historial(idProyecto) {
    const response = await api.get(`/asistencia/proyecto/${idProyecto}/historial`);
    return response.data ?? response;
  },

  /** PUT /asistencia/:id_asistencia/empleado/:id_empleado/historial */
  async editarHistorial(idAsistencia, idEmpleado, data) {
    const response = await api.put(
      `/asistencia/${idAsistencia}/empleado/${idEmpleado}/historial`,
      data
    );
    return response.data ?? response;
  },

  /** POST /asistencia/marcar */
  async marcar(data) {
    const response = await api.post("/asistencia/marcar", data);
    return response.data ?? response;
  },

  /** GET /asistencia/proyecto/:id_proyecto/mis-asistencias */
  async obtenerMisAsistencias() {
    const response = await api.get("/asistencia/mi-historial");
    return response.data ?? response;
  },
  /**
   * Obtener el turno activo del empleado autenticado.
   * GET /asistencia/mi-turno
   */
  async obtenerMiTurno() {
    const response = await api.get("/asistencia/mi-turno");
    return response.data ?? response;
  },

  /**
   * Obtener mi asistencia del día de hoy filtrada por turno.
   * GET /asistencia/mi-asistencia-hoy?id_turno=X
   * Retorna directamente { code, data } sin envoltura adicional.
   */
  async obtenerMiAsistenciaActual(idTurno) {
    const response = await api.get(
      `/asistencia/mi-asistencia-hoy?id_turno=${idTurno}&_cb=${Date.now()}`
    );
    return response.data;
  },
};