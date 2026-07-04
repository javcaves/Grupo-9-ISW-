// src/components/notificaciones/NotificacionBell.jsx
import React, { useState } from 'react';
import { useNotificaciones } from '../../context/NotificacionesContext';
import NotificacionesModal from './NotificacionesModal';

export default function NotificacionBell() {
  const { noLeidas } = useNotificaciones();
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalAbierto(true)}
        className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        aria-label="Notificaciones"
      >
        <i className="fas fa-bell text-sm" style={{ color: 'var(--text-primary)' }} />

        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      <NotificacionesModal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} />
    </>
  );
}
