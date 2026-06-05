import React, { useState, useRef, useEffect } from 'react';

export default function UserMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón / Icono del Usuario */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold shadow-sm hover:scale-105 transition-transform"
      >
        {user?.nombre?.[0] || "U"}
      </button>

      {/* Menú desplegable (El "Modal") */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="mb-4">
            <p className="font-bold text-slate-800">{user?.nombre}</p>
            <p className="text-xs text-slate-500">{user?.rol}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-full text-left text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}