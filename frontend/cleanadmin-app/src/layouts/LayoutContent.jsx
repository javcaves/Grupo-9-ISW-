import React from 'react';

export default function LayoutContent({ 
  header, 
  stats, 
  table, 
  actions = [] // Array de botones
}) {
  return (
    <section className="view-panel p-7">
      <div className="panel-header flex justify-between items-center mb-7">
        <div>
          <h3>{header.title}</h3>
          <p>{header.subtitle}</p>
        </div>

        {/* Grilla de botones: crece de derecha a izquierda */}
        <div className="flex flex-row-reverse gap-3">
          {actions.map((btn, index) => (
            <div key={index}>{btn}</div>
          ))}
        </div>
      </div>

      {stats && <div className="stats-grid">{stats}</div>}
      
      <div className="table-wrapper">
        {table}
      </div>
    </section>
  );
}