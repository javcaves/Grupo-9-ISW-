import React from 'react';
import ButtonTemplate from '../components/Buttons';

export default function LayoutContent({ 
  header, 
  stats, 
  table, 
  actions = [] 
}) {
  return (
    <section className="view-panel bg-white/70 backdrop-blur-lg border border-slate-200/50 rounded-3xl p-8 shadow-xl">
      {/* Encabezado: Título y Acciones */}
      <div className="panel-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{header.title}</h3>
          <p className="text-slate-500 mt-1">{header.subtitle}</p>
        </div>

        {/* Contenedor de botones */}
        <div className="flex flex-wrap flex-row-reverse gap-3">
          {actions.map((btn, index) => (
            <ButtonTemplate 
              key={index}
              text={btn.text}
              className={btn.className}
              onClick={btn.onClick}
              // Si tu ButtonTemplate soporta iconos:
              icon={btn.icon} 
            />
          ))}
        </div>
      </div>

      {/* Grilla de Stats (si existen) */}
      {stats && (
        <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats}
        </div>
      )}
      
      {/* Contenedor de la Tabla */}
      {table && (
        <div className="table-wrapper bg-white/50 rounded-2xl border border-slate-100 overflow-hidden">
          {table}
        </div>
      )}
    </section>
  );
}