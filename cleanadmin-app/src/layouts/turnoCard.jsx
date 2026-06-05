import React from 'react';
import { Card } from '../components/Card.jsx'; // Asegúrate de que la ruta apunte a tu componente

export const TurnoCard = ({ turno, onEdit }) => {
  
  // Creamos un pequeño "Badge" o etiqueta para inyectarlo en el headerAction de tu Card
  const badgeActivo = (
    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
      Activo
    </span>
  );

  return (
    <Card
      title={turno.descripcion ? turno.descripcion.split(' ').slice(0, 3).join(' ') : 'Turno sin título'}
      subtitle={`ID: #${turno.id.toString().slice(-4)}`}
      icon="fa-clock" // Usa un ícono de reloj (asumiendo que usas FontAwesome por la clase 'fas')
      headerAction={badgeActivo}
      className="rounded-2xl flex flex-col h-full"
    >
      {/* Todo esto entra automáticamente como 'children' dentro de tu Card */}
      <div className="flex flex-col flex-grow">
        
        {/* Descripción */}
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
          {turno.descripcion || 'Sin descripción adicional.'}
        </p>
        
        {/* Bloque de Horarios */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-sm mb-5">
          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase">Ingreso</span>
            <span className="font-semibold text-slate-700">{turno.ingreso} hrs</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase">Salida</span>
            <span className="font-semibold text-slate-700">{turno.salida} hrs</span>
          </div>
        </div>

        {/* Botón para Modificar que llama a la función del padre */}
        <button
          onClick={() => onEdit(turno)}
          className="w-full mt-auto py-2 text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors duration-200 focus:outline-none"
        >
          ✏️ Modificar Datos
        </button>
      </div>
    </Card>
  );
};