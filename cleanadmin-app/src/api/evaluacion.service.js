import { api } from "./api";

export const EvaluacionService = {

  /**
   * Hoja de vida de un empleado: todas sus evaluaciones de desempeño.
   * GET /evaluaciones/empleado/:id_empleado
   */
  async listarPorEmpleado(idEmpleado) {
    const response = await api.get(`/evaluaciones/empleado/${idEmpleado}`);
    return response.data ?? response;
  },

  /**
   * Evaluaciones registradas para una tarea puntual.
   * GET /evaluaciones/tarea/:id_tarea
   */
  async listarPorTarea(idTarea) {
    const response = await api.get(`/evaluaciones/tarea/${idTarea}`);
    return response.data ?? response;
  },

  /**
   * Registrar una evaluación de desempeño.
   * POST /evaluaciones
   */
  async crear(data) {
    const response = await api.post("/evaluaciones", data);
    return response.data ?? response;
  },

  /**
   * Revocar (soft delete) una evaluación.
   */
  async revocar(id) {
    const response = await api.patch(`/evaluaciones/${id}/revocar`);
    return response.data ?? response;
  },

};
