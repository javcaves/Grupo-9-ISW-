// src/api/turno.service.js

import { api } from "./api";

const URL = "/turno";

export const TurnoService = {

  // ==================== TURNO ====================

  /**
   * Obtiene todos los turnos.
   */
  async listar() {

    const response = await api.get(URL);

    return response.data;

  },

  /**
   * Obtiene un turno por ID.
   */
  async obtenerPorId(idTurno) {

    const response = await api.get(
      `${URL}/${idTurno}`
    );

    return response.data;

  },

  /**
   * Obtiene todos los turnos de un proyecto.
   */
  async listarPorProyecto(idProyecto) {

    const response = await api.get(
      `${URL}/proyecto/${idProyecto}`
    );

    return response.data;

  },

  /**
   * Crea un turno.
   */
  async crear(datos) {

    const response = await api.post(
      URL,
      datos
    );

    return response.data;

  },

  /**
   * Actualiza un turno.
   */
  async actualizar(idTurno, datos) {

    const response = await api.put(
      `${URL}/${idTurno}`,
      datos
    );

    return response.data;

  },

  /**
   * Elimina (soft delete) un turno.
   */
  async eliminar(idTurno) {

    const response = await api.delete(
      `${URL}/${idTurno}`
    );

    return response.data;

  },

  // ==================== TURNO_EMPLEADO ====================

  /**
   * Agrega un empleado al turno.
   */
  async agregarEmpleado(idTurno, idEmpleado) {

    const response = await api.post(
      `${URL}/${idTurno}/empleados/${idEmpleado}`
    );

    return response.data;

  },

  /**
   * Elimina un empleado del turno.
   * Puede devolver requiere_confirmacion.
   */
  async eliminarEmpleado(idTurno, idEmpleado) {

    const response = await api.delete(
      `${URL}/${idTurno}/empleados/${idEmpleado}`
    );

    return response.data;

  },

  /**
   * Confirma la eliminación del empleado junto con la asistencia.
   */
  async confirmarEliminacion(idTurno, idEmpleado) {

    const response = await api.delete(
      `${URL}/${idTurno}/empleados/${idEmpleado}/confirmar`
    );

    return response.data;

  },

  /**
   * Configura la colación del empleado.
   */
  async configurarColacion(idTurno, idEmpleado, datos) {

    const response = await api.put(
      `${URL}/${idTurno}/empleados/${idEmpleado}/colacion`,
      datos
    );

    return response.data;

  },

  /**
   * Configura si el empleado trabaja feriados.
   */
  async configurarFeriados(
    idTurno,
    idEmpleado,
    trabajaFeriados
  ) {

    const response = await api.put(
      `${URL}/${idTurno}/empleados/${idEmpleado}/feriados`,
      {
        trabaja_feriados: trabajaFeriados,
      }
    );

    return response.data;

  },

};