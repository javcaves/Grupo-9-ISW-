import React from 'react';

export default function ButtonTemplate({ text, icon: Icon, className = "", onClick }) {
  return (
    <button 
      onClick={onClick}
      // "className" recibe el color y estilo
      className={`px-4 py-2 font-medium rounded-lg shadow transition duration-200 flex items-center gap-2 cursor-pointer ${className}`}
    >
      {/* Si pasan un icono, se dibuja automáticamente */}
      {Icon && <Icon size={18} />}
      
      {/*texto del botón */}
      {text}
    </button>
  );
}