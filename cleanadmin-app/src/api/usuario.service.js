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
   * Cambia la contraseña de un usuario (ej. la olvidó y un admin se la resetea).
   * TODO: endpoint asumido, no confirmado contra el backend real — ajustar
   * la ruta/método si el backend expone esto distinto (ej. PATCH, u otro path).
   */
    resetearPassword(idUsuario, nuevaPassword) {
    return api.put(`${URL}/${idUsuario}/reset-password`, { password: nuevaPassword });
  },

  // Alias, por si algo del código existente sigue llamando cambiarPassword.
  cambiarPassword(idUsuario, nuevaPassword) {
    return this.resetearPassword(idUsuario, nuevaPassword);
  },

  /**
   * Cambia la propia contraseña del usuario autenticado (requiere la actual).
   * Endpoint distinto al de reseteo por admin: aquí se valida passwordActual.
   * TODO: asumo que el backend identifica al usuario por sesión/cookie
   * (mismo patrón que AuthService.me()), por eso no se manda id_usuario.
   * Ajustar ruta/payload si el backend real difiere.
   */
  cambiarMiPassword(passwordActual, passwordNueva) {

    return api.put(
      `${URL}/me/password`,
      { passwordActual, passwordNueva }
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
