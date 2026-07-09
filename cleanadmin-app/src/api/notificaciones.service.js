// src/api/notificaciones.service.js
import { api } from "./api";

export const NotificacionesService = {

  listar(params = {}) {
    return api.get("/notificaciones", params);
  },

  // Para la campana: solo lo que sigue requiriendo acción.
  listarNoResueltas() {
    return api.get("/notificaciones", { resuelto: false });
  },

  // Para el historial: filtros opcionales { tipo, resuelto }.
  historial(filtros = {}) {
    return api.get("/notificaciones", filtros);
  },

  marcarLeida(idNotificacion) {
    return api.put(`/notificaciones/${idNotificacion}/leido`);
  },

  marcarTodasLeidas() {
    return api.put("/notificaciones/leido-todas");
  },

  solicitarRecuperacionPassword(identifier) {
    return api.post("/notificaciones/solicitud-password", { identifier });
  },

};