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

  /**
   * Endpoint público (no requiere sesión): notifica a los ADMIN/ROOT que
   * alguien solicitó recuperar su contraseña.
   */
  solicitarRecuperacionPassword(identifier) {
    return api.post("/notificaciones/solicitud-password", { identifier });
  },

};
