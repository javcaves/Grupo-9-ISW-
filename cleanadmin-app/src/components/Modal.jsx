import React, { useEffect } from 'react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  variant = 'center', // 'center' o 'side'
  children,
}) => {
  
  // Bloquear el scroll del fondo cuando el modal esté abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Clases compartidas y condicionales para las variantes en Tailwind
  const containerClasses = 
    variant === 'side'
      ? 'fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl animate-slide-in-right flex flex-col z-50'
      : variant === 'wide'
        ? 'relative w-full max-w-5xl bg-white rounded-xl shadow-xl max-h-[85vh] animate-scale-up flex flex-col z-50'
        : 'relative w-full max-w-lg bg-white rounded-xl shadow-xl max-h-[85vh] animate-scale-up flex flex-col z-50';

  return (
    // Overlay (Fondo oscuro difuminado)
    <div 
      className="fixed inset-0 bg-black/25 flex justify-center items-center z-50 animate-fade-in"
      onClick={onClose}
    >
      {/* Contenedor del Modal */}
      <div 
        className={containerClasses} 
        onClick={(e) => e.stopPropagation()} // Evita que se cierre al clickear dentro
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl font-semibold transition-colors duration-200 focus:outline-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Contenido Inyectado */}
        <div className="p-6 overflow-y-auto flex-1 text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};