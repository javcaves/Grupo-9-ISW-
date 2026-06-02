import React, { useState } from 'react';
import { Modal } from './Modal.jsx';

export const GestionTurnos = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Variables específicas de la categoría de Turnos
  const [nombreTurno, setNombreTurno] = useState('');
  const [horaIngreso, setHoraIngreso] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Guardando en API /turnos:', { nombreTurno, horaIngreso });
    setIsOpen(false);
  };

  return (
    <div className="p-4">
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-200"
      >
        + Crear Nuevo Turno
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Configurar Nuevo Turno"
        variant="side"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Turno</label>
            <input 
              type="text" 
              value={nombreTurno}
              onChange={(e) => setNombreTurno(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Ingreso</label>
            <input 
              type="time" 
              value={horaIngreso}
              onChange={(e) => setHoraIngreso(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required 
            />
          </div>

          <button 
            type="submit"
            className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition"
          >
            Guardar Cambios
          </button>
        </form>
      </Modal>
    </div>
  );
};