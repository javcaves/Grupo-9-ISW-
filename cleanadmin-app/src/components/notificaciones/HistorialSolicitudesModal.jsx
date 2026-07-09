// src/components/notificaciones/HistorialSolicitudesModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../Modal';
import { NotificacionesService } from '../../api/notificaciones.service';
import { extraerListado } from '../../utils/apiResponse';
import { ETIQUETAS_TIPO, formatearFecha } from './notificacionMeta';

const OPCIONES_TIPO = [
  { value: '', label: 'Todos los tipos' },
  { value: 'SOLICITUD_PENDIENTE', label: 'Solicitud de item' },
  { value: 'SOLICITUD_APROBADA', label: 'Item aprobado' },
  { value: 'SOLICITUD_RECHAZADA', label: 'Item rechazado' },
  { value: 'SOLICITUD_PASSWORD', label: 'Recuperación de contraseña' },
  { value: 'SOLICITUD_ASISTENCIA', label: 'Corrección de asistencia' },
];

const OPCIONES_RESOLUCION = [
  { value: '', label: 'Todas' },
  { value: 'false', label: 'Pendientes' },
  { value: 'true', label: 'Resueltas' },
];

export default function HistorialSolicitudesModal({ isOpen, onClose }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [tipo, setTipo] = useState('');
  const [resuelto, setResuelto] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const filtros = {};
      if (tipo) filtros.tipo = tipo;
      if (resuelto !== '') filtros.resuelto = resuelto === 'true';

      const res = await NotificacionesService.historial(filtros);
      setNotificaciones(extraerListado(res));
    } catch (error) {
      console.error('Error al cargar historial de solicitudes:', error);
    } finally {
      setCargando(false);
    }
  }, [tipo, resuelto]);

  useEffect(() => {
    if (isOpen) cargar();
  }, [isOpen, cargar]);

  const ordenadas = [...notificaciones].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Historial de solicitudes" variant="side">
      <div className="flex gap-2 mb-4">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {OPCIONES_TIPO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={resuelto}
          onChange={(e) => setResuelto(e.target.value)}
          className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {OPCIONES_RESOLUCION.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {cargando && (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
          Cargando historial...
        </p>
      )}

      {!cargando && (
        <div className="space-y-1 max-h-[65vh] overflow-y-auto">
          {ordenadas.map((notif) => {
            const meta = ETIQUETAS_TIPO[notif.tipo] || { texto: notif.tipo, color: 'text-gray-600', icono: 'fa-bell' };

            return (
              <div
                key={notif.id_notificacion}
                className="w-full text-left px-3 py-3 rounded-xl flex items-start gap-3"
                style={{ background: 'var(--bg-color)' }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color} bg-current/10`}>
                  <i className={`fas ${meta.icono} text-xs ${meta.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${meta.color}`}>{meta.texto}</p>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        notif.resuelto ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {notif.resuelto ? 'Resuelta' : 'Pendiente'}
                    </span>
                  </div>
                  {notif.mensaje && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {notif.mensaje}
                    </p>
                  )}
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {formatearFecha(notif.fecha)}
                  </p>
                </div>
              </div>
            );
          })}

          {ordenadas.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No hay solicitudes que calcen con estos filtros.
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}