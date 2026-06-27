import { api } from "./api";

const URL = "/usuarios";

export const UsuarioService = {

  buscar(filtros = {}) {
    return api.get(URL, filtros);
  },

  obtener(idUsuario) {
    return api.get(`${URL}/${idUsuario}`);
  },

  registrar(usuario) {
    return api.post(URL, usuario);
  },

  actualizar(idUsuario, usuario) {
    return api.put(`${URL}/${idUsuario}`, usuario);
  },

  eliminar(idUsuario) {
    return api.delete(`${URL}/${idUsuario}`);
  },

};