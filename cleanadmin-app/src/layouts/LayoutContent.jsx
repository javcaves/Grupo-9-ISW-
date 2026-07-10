import React from 'react';
import ButtonTemplate from '../components/Buttons';

export default function LayoutContent({ 
  header, 
  toolbar,
  stats, 
  table, 
  actions = [],
  statsCols = 4, // cantidad de columnas de la grilla de tarjetas en desktop (lg). Default 4 para no afectar a las demás vistas.
}) {
  const COLS_LG = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  };
  const claseColsLg = COLS_LG[statsCols] ?? COLS_LG[4];

  return (
    <section 
      className="view-panel backdrop-blur-lg rounded-3xl p-8 shadow-xl border"
      style={{
        backgroundColor: 'var(--lc-bg)',
        borderColor: 'var(--lc-border)'
      }}
    >
      {/* Encabezado: Título y Acciones */}
      <div className="panel-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--lc-title)' }}>
            {header.title}
          </h3>
          <p className="mt-1" style={{ color: 'var(--lc-subtitle)' }}>
            {header.subtitle}
          </p>
        </div>

        {/* Contenedor de botones */}
        <div className="flex flex-wrap flex-row-reverse gap-3">
          {actions.map((btn, index) => (
            <ButtonTemplate 
              key={index}
              text={btn.text}
              className={btn.className}
              variant={btn.variant}
              onClick={btn.onClick}
              icon={btn.icon} 
            />
          ))}
        </div>
      </div>

      {/* Barra de herramientas y filtros */}
      {toolbar && (
        <div className="mb-6">
          {toolbar}
        </div>
      )}

      {/* Grilla de Stats (tarjetas) */}
      {stats && (
        <div className={`stats-grid grid grid-cols-1 md:grid-cols-2 ${claseColsLg} gap-6 mb-8`}>
          {stats}
        </div>
      )}
      
      {/* Contenedor de la Tabla */}
      {table && (
        <div 
          className="table-wrapper rounded-2xl overflow-hidden border"
          style={{
            backgroundColor: 'var(--lc-table-bg)',
            borderColor: 'var(--lc-table-border)'
          }}
        >
          {table}
        </div>
      )}
    </section>
  );
}
