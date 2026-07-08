import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import NotificacionBell from './notificaciones/NotificacionBell';
import CambiarMiPasswordModal from './modals/CambiarMiPasswordModal';

export default function UserMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
  const menuRef = useRef(null);

  const {
    isDarkMode,
    toggleTheme
  } = useTheme();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-3">
      {/* Visible siempre, independiente de si el dropdown del avatar está abierto */}
      <NotificacionBell />

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-gradient-to-tr hover:cursor-pointer from-indigo-500 to-blue-500 text-white flex items-center justify-center font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          {user?.nombre?.[0]?.toUpperCase() || 'U'}
        </button>

        {isOpen && (
          <div
            className="absolute right-0 mt-3 w-72 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border p-3 z-50 animate-in fade-in zoom-in-95 duration-200"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div
              className="rounded-2xl p-4 mb-3 border"
              style={{
                background: 'var(--bg-color)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                  {user?.nombre?.[0]?.toUpperCase() || 'U'}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold text-sm truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {user?.nombre || 'Usuario'}
                  </p>

                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest truncate">
                    {user?.rol || 'Sin cargo'}
                  </p>

                  <p
                    className="text-[11px] font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {user?.rut || 'Sin RUT'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--bg-color)' }}
                  >
                    <i
                      className="fas fa-moon text-xs"
                      style={{ color: 'var(--text-secondary)' }}
                    />
                  </div>

                  <span
                    className="font-medium text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Cambiar tema
                  </span>
                </div>

                <div
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-indigo-500'
                      : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                      isDarkMode
                        ? 'translate-x-6'
                        : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>

              <button
                onClick={() => { setModalPasswordAbierto(true); setIsOpen(false); }}
                className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl transition-all duration-200"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--bg-color)' }}
                >
                  <i
                    className="fas fa-key text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                </div>

                <span
                  className="font-medium text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Cambiar contraseña
                </span>
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 text-left text-sm text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-xl transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <i className="fas fa-sign-out-alt text-red-500 text-xs"></i>
                </div>

                <span className="font-medium text-red-600">
                  Cerrar sesión
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <CambiarMiPasswordModal
        isOpen={modalPasswordAbierto}
        onClose={() => setModalPasswordAbierto(false)}
      />
    </div>
  );
}
