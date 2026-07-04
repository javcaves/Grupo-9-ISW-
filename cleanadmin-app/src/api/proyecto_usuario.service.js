// src/api/proyecto_usuario.service.js

import { api } from "./api";

const URL = "/proyecto";

export const ProyectoUsuarioService = {

  /**
   * Obtiene los usuarios asociados a un proyecto.
   * Puede recibir filtros por query (ej. rol).
   */
  async listarUsuarios(idProyecto, filtros = {}) {

    const response = await api.get(
      `${URL}/${idProyecto}/usuarios`,
      filtros
    );

    return response.data;

  },

  /**
   * Asigna un usuario a un proyecto.
   */
  async asignarUsuario(idProyecto, datos) {

    const response = await api.post(
      `${URL}/${idProyecto}/usuarios`,
      datos
    );

    return response.data;

  },

  /**
   * Desvincula un usuario de un proyecto.
   */
  async desvincularUsuario(
    idProyecto,
    idUsuario
  ) {

    const response = await api.delete(
      `${URL}/${idProyecto}/usuarios/${idUsuario}`
    );

    return response.data;

  },

};