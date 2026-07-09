// src/components/notificaciones/NotificacionesModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { useNotificaciones } from '../../context/NotificacionesContext';
import SolicitudResolverModal from './SolicitudResolverModal';

const ETIQUETAS_TIPO = {
  SOLICITUD_PENDIENTE: { texto: 'Nueva solicitud', color: 'text-indigo-600', icono: 'fa-inbox' },
  SOLICITUD_APROBADA: { texto: 'Solicitud aprobada', color: 'text-emerald-600', icono: 'fa-check-circle' },
  SOLICITUD_RECHAZADA: { texto: 'Solicitud rechazada', color: 'text-red-600', icono: 'fa-times-circle' },
  SOLICITUD_PASSWORD: { texto: 'Recuperación de contraseña', color: 'text-amber-600', icono: 'fa-key' },
};

function formatearFecha(fechaIso) {
  try {
    return new Date(fechaIso).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return fechaIso;
  }
}

export default function NotificacionesModal({ isOpen, onClose }) {
  const { notificaciones, marcarLeida, marcarTodasLeidas, refrescar } = useNotificaciones();
  const [idMovimientoSeleccionado, setIdMovimientoSeleccionado] = useState(null);

  // FIX: antes la lista solo se cargaba al montar NotificacionesProvider
  // (una vez) + cada 10 minutos en background. Si el usuario ya tenía la
  // pestaña abierta y logeado desde antes de que se generara una
  // notificación nueva (ej. alguien pidió recuperar su contraseña
  // después), la campana se quedaba mostrando datos viejos hasta el
  // próximo poll. Ahora, cada vez que se ABRE el modal, se pide la lista
  // fresca -- así "hacer clic en la campana" siempre trae lo último,
  // sin depender del timer.
  useEffect(() => {
    if (isOpen) refrescar();
  }, [isOpen, refrescar]);

  const ordenadas = [...notificaciones].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  const handleClickNotificacion = (notif) => {
    if (!notif.leido) marcarLeida(notif.id_notificacion);

    if (notif.tipo === 'SOLICITUD_PENDIENTE') {
      // id_referencia reemplaza al viejo id_movimiento (ver notificacion.entity.js);
      // para este tipo, tipo_referencia siempre es "MOVIMIENTO_INVENTARIO".
      setIdMovimientoSeleccionado(notif.id_referencia);
    }
    // para APROBADA/RECHAZADA/PASSWORD no hay acción adicional, solo se marca leida
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Notificaciones" variant="side">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {notificaciones.length === 0
              ? 'No tienes notificaciones'
              : `${notificaciones.length} en total`}
          </p>
          {notificaciones.some((n) => !n.leido) && (
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

          {notificaciones.length === 0 && (
            <div className="text-center py-10">
              <i className="fas fa-inbox text-2xl mb-2" style={{ color: 'var(--text-secondary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Al día — nada pendiente por revisar.
              </p>
            </div>
          )}
        </div>
      </Modal>

      <SolicitudResolverModal
        isOpen={idMovimientoSeleccionado !== null}
        idMovimiento={idMovimientoSeleccionado}
        onClose={() => setIdMovimientoSeleccionado(null)}
      />
    </>
  );
}
