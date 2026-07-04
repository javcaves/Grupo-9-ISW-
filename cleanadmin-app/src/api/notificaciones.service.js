// src/api/notificaciones.service.js

import { api } from "./api";

export const NotificacionesService = {

  listar(params = {}) {
    return api.get("/notificaciones", params);
  },

  marcarLeida(idNotificacion) {
    return api.put(`/notificaciones/${idNotificacion}/leido`);
  },

  marcarTodasLeidas() {
    return api.put("/notificaciones/leido-todas");
  },

};
