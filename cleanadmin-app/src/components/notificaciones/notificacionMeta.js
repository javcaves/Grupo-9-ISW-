// src/components/notificaciones/notificacionMeta.js

export const ETIQUETAS_TIPO = {
  SOLICITUD_PENDIENTE: { texto: 'Solicitud de item', color: 'text-indigo-600', icono: 'fa-inbox' },
  SOLICITUD_APROBADA: { texto: 'Item aprobado', color: 'text-emerald-600', icono: 'fa-check-circle' },
  SOLICITUD_RECHAZADA: { texto: 'Item rechazado', color: 'text-red-600', icono: 'fa-times-circle' },
  SOLICITUD_PASSWORD: { texto: 'Recuperación de contraseña', color: 'text-amber-600', icono: 'fa-key' },
  SOLICITUD_ASISTENCIA: { texto: 'Corrección de asistencia', color: 'text-blue-600', icono: 'fa-calendar-check' },
};

export function formatearFecha(fechaIso) {
  try {
    return new Date(fechaIso).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return fechaIso;
  }
}