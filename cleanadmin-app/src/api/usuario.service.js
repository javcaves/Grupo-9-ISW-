// src/api/usuario.service.js

import { api } from "./api";

const URL = "/usuarios";

export const UsuarioService = {

  listar(filtros = {}) {
    return this.buscar(filtros);
  },

  /**
   * Obtiene todos los usuarios.
   * Permite filtros:
   * nombre, rol, poder, rut.
   */
  buscar(filtros = {}) {

    return api.get(URL, filtros);

  },

  /**
   * Obtiene un usuario por su ID.
   */
  obtenerPorId(idUsuario) {

    return api.get(`${URL}/${idUsuario}`);

  },

  /**
   * Registra un nuevo usuario.
   */
  registrar(usuario) {

    return api.post(URL, usuario);

  },

  /**
   * Actualiza un usuario.
   */
  actualizar(idUsuario, usuario) {

    return api.put(
      `${URL}/${idUsuario}`,
      usuario
    );

  },

  /**
   * Eliminación lógica.
   */
  eliminar(idUsuario) {

    return api.delete(
      `${URL}/${idUsuario}`
    );

  },

};