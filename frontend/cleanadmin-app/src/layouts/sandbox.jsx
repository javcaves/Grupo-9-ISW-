import React, { useState } from 'react';
import { Modal } from './Modal'; // Asegúrate de que la ruta apunte a tu componente Modal

export const Sandbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [variant, setVariant] = useState('center');
  const [categoria, setCategoria] = useState('turnos');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🛠️ Sandbox: Pruebas UI CleanAdmin</h1>
        
        {/* Controles de Configuración */}
        <div className="space-y-6 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">1. Selecciona la Variante (Posición)</h3>
            <div className="flex gap-4">
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition ${variant === 'center' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setVariant('center')}
              >
                Modal Centrado
              </button>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition ${variant === 'side' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setVariant('side')}
              >
                Panel Lateral (Drawer)
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">2. Selecciona el Contenido Inyectado</h3>
            <div className="flex gap-4">
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition ${categoria === 'turnos' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setCategoria('turnos')}
              >
                Formulario de Turnos
              </button>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition ${categoria === 'asistencia' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setCategoria('asistencia')}
              >
                Auditoría de Asistencia
              </button>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Botón Lanzador */}
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg shadow-lg transition duration-200"
        >
          Lanzar Componente Modal
        </button>
      </div>

      {/* El Componente Modal Reutilizable */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={categoria === 'turnos' ? "Configurar Nuevo Turno" : "Auditoría de Asistencia"}
        variant={variant}
      >
        {categoria === 'turnos' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Simulación de inyección del módulo de Turnos.</p>
            <input type="text" placeholder="Nombre del Turno" className="w-full px-3 py-2 border rounded-md" />
            <input type="time" className="w-full px-3 py-2 border rounded-md" />
            <button className="w-full bg-indigo-600 text-white py-2 rounded-md">Guardar Turno</button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Simulación de inyección del módulo de Asistencia.</p>
            <select className="w-full px-3 py-2 border rounded-md">
              <option>PRESENTE</option>
              <option>AUSENTE</option>
              <option>EN_ESPERA</option>
            </select>
            <textarea placeholder="Justificación obligatoria..." className="w-full px-3 py-2 border rounded-md" rows="3"></textarea>
            <button className="w-full bg-emerald-600 text-white py-2 rounded-md">Confirmar Cambio</button>
          </div>
        )}
      </Modal>
    </div>
  );
};