// src/components/notificaciones/NotificacionesModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { useNotificaciones } from '../../context/NotificacionesContext';
import SolicitudResolverModal from './SolicitudResolverModal';
import PasswordResolverModal from './PasswordResolverModal';
import AsistenciaSolicitudResolverModal from './AsistenciaSolicitudResolverModal';
import HistorialSolicitudesModal from './HistorialSolicitudesModal';
import { ETIQUETAS_TIPO, formatearFecha } from './notificacionMeta';

export default function NotificacionesModal({ isOpen, onClose }) {
  const { notificaciones, marcarLeida, marcarTodasLeidas, refrescar } = useNotificaciones();

  const [idMovimientoSeleccionado, setIdMovimientoSeleccionado] = useState(null);
  const [idUsuarioPasswordSeleccionado, setIdUsuarioPasswordSeleccionado] = useState(null);
  const [idSolicitudAsistenciaSeleccionada, setIdSolicitudAsistenciaSeleccionada] = useState(null);
  const [historialAbierto, setHistorialAbierto] = useState(false);

  useEffect(() => {
    if (isOpen) refrescar();
  }, [isOpen, refrescar]);

  // Defensivo: aunque el context ya pide solo resuelto=false al backend,
  // filtramos también acá por si algo llega resuelto en el medio de un poll.
  const pendientes = notificaciones.filter((n) => !n.resuelto);
  const ordenadas = [...pendientes].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  const handleClickNotificacion = (notif) => {
    if (!notif.leido) marcarLeida(notif.id_notificacion);

    switch (notif.tipo) {
      case 'SOLICITUD_PENDIENTE':
        setIdMovimientoSeleccionado(notif.id_referencia);
        break;
      case 'SOLICITUD_PASSWORD':
        setIdUsuarioPasswordSeleccionado(notif.id_referencia);
        break;
      case 'SOLICITUD_ASISTENCIA':
        setIdSolicitudAsistenciaSeleccionada(notif.id_referencia);
        break;
      default:
        // SOLICITUD_APROBADA / SOLICITUD_RECHAZADA: informativas, no
        // requieren acción; ya nacen con resuelto=true así que en teoría
        // ni deberían aparecer acá, pero por si acaso no hacen nada más
        // que marcarse como leídas.
        break;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Notificaciones" variant="side">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {pendientes.length === 0
              ? 'No tienes solicitudes pendientes'
              : `${pendientes.length} pendiente${pendientes.length === 1 ? '' : 's'}`}
          </p>
          {pendientes.some((n) => !n.leido) && (
            <button
              onClick={marcarTodasLeidas}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
          {ordenadas.map((notif) => {
            const meta = ETIQUETAS_TIPO[notif.tipo] || { texto: notif.tipo, color: 'text-gray-600', icono: 'fa-bell' };

            return (
              <button
                key={notif.id_notificacion}
                onClick={() => handleClickNotificacion(notif)}
                className="w-full text-left px-3 py-3 rounded-xl transition-all duration-200 flex items-start gap-3"
                style={{
                  background: notif.leido ? 'transparent' : 'var(--bg-color)',
                }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color} bg-current/10`}>
                  <i className={`fas ${meta.icono} text-xs ${meta.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${meta.color}`}>{meta.texto}</p>
                    {!notif.leido && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    )}
                  </div>
                  {notif.mensaje && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                      {notif.mensaje}
                    </p>
                  )}
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {formatearFecha(notif.fecha)}
                  </p>
                </div>
              </button>
            );
          })}

          {pendientes.length === 0 && (
            <div className="text-center py-10">
              <i className="fas fa-inbox text-2xl mb-2" style={{ color: 'var(--text-secondary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Al día — nada pendiente por revisar.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setHistorialAbierto(true)}
          className="w-full mt-3 px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
        >
          <i className="fas fa-clock-rotate-left text-xs" />
          Ver historial de solicitudes
        </button>
      </Modal>

      <SolicitudResolverModal
        isOpen={idMovimientoSeleccionado !== null}
        idMovimiento={idMovimientoSeleccionado}
        onClose={() => setIdMovimientoSeleccionado(null)}
      />

      <PasswordResolverModal
        isOpen={idUsuarioPasswordSeleccionado !== null}
        idUsuario={idUsuarioPasswordSeleccionado}
        onClose={() => setIdUsuarioPasswordSeleccionado(null)}
      />

      <AsistenciaSolicitudResolverModal
        isOpen={idSolicitudAsistenciaSeleccionada !== null}
        idSolicitud={idSolicitudAsistenciaSeleccionada}
        onClose={() => setIdSolicitudAsistenciaSeleccionada(null)}
      />

      <HistorialSolicitudesModal
        isOpen={historialAbierto}
        onClose={() => setHistorialAbierto(false)}
      />
    </>
  );
}