// src/components/notificaciones/AsistenciaSolicitudResolverModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { AsistenciaService } from '../../api/asistencia.service';
import { useNotificaciones } from '../../context/NotificacionesContext';

const ETIQUETAS_ESTADO = {
  PRESENTE: 'Presente',
  ATRASO: 'Atraso',
  FALTA_INJUSTIFICADA: 'Falta Injustificada',
  FALTA_JUSTIFICADA: 'Falta Justificada',
  EN_ESPERA: 'Esperando Marcaje',
  RETIRADO: 'Retirado Anticipadamente',
};

export default function AsistenciaSolicitudResolverModal({ isOpen, idSolicitud, onClose }) {
  const { refrescar } = useNotificaciones();

  const [solicitud, setSolicitud] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [noEncontrada, setNoEncontrada] = useState(false);

  useEffect(() => {
    if (!isOpen || idSolicitud == null) return;

    let cancelado = false;

    (async () => {
      setCargando(true);
      setNoEncontrada(false);
      setSolicitud(null);
      try {
        const pendientes = await AsistenciaService.listarSolicitudesPendientes();
        const match = (pendientes || []).find((s) => s.id_solicitud === idSolicitud);
        if (cancelado) return;

        if (!match) {
          setNoEncontrada(true);
          return;
        }
        setSolicitud(match);
      } catch (error) {
        console.error('Error al cargar la solicitud de asistencia:', error);
        if (!cancelado) setNoEncontrada(true);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => { cancelado = true; };
  }, [isOpen, idSolicitud]);

  const resolver = async (decision) => {
    setEnviando(true);
    try {
      await AsistenciaService.resolverSolicitud(idSolicitud, { decision });
      await refrescar();
      onClose();
    } catch (error) {
      console.error('Error al resolver la solicitud de asistencia:', error);
      alert('No se pudo resolver la solicitud. Revisa la consola para más detalle.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Corrección de asistencia" icon="fa-calendar-check">
      {cargando && (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
          Cargando solicitud...
        </p>
      )}

      {!cargando && noEncontrada && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Esta solicitud ya no está pendiente (probablemente alguien más ya la resolvió).
          </p>
          <button onClick={onClose} className="mt-4 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200">
            Cerrar
          </button>
        </div>
      )}

      {!cargando && solicitud && (
        <div className="space-y-4">
          <div
            className="rounded-2xl p-4 border space-y-2"
            style={{ background: 'var(--bg-color)', borderColor: 'var(--border-color)' }}
          >
            <Dato label="Empleado" valor={`#${solicitud.id_empleado}`} />
            <Dato label="Asistencia" valor={`#${solicitud.id_asistencia}`} />
            {solicitud.estado_solicitado && (
              <Dato label="Estado propuesto" valor={ETIQUETAS_ESTADO[solicitud.estado_solicitado] || solicitud.estado_solicitado} />
            )}
            {solicitud.hora_ingreso_solicitada && (
              <Dato label="Hora ingreso propuesta" valor={solicitud.hora_ingreso_solicitada} />
            )}
            {solicitud.hora_egreso_solicitada && (
              <Dato label="Hora egreso propuesta" valor={solicitud.hora_egreso_solicitada} />
            )}
            <div className="text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Motivo</span>
              <p className="font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{solicitud.motivo}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              disabled={enviando}
              onClick={() => resolver('RECHAZADO')}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
            >
              Rechazar
            </button>
            <button
              disabled={enviando}
              onClick={() => resolver('APROBADO')}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              Aprobar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Dato({ label, valor }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{valor}</span>
    </div>
  );
}