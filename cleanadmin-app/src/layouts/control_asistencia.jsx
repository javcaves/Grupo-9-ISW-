import React, { useState } from 'react';
import { Modal } from './Modal';

export const ControlAsistencia = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Variables específicas de los requisitos de Asistencia
  const [estado, setEstado] = useState('EN_ESPERA');
  const [descripcion, setDescripcion] = useState('');

  return (
    <div className="p-4">
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow transition duration-200"
      >
        Auditar Asistencia
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Modificar Registro Colectivo / Individual"
        variant="center"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Estás editando la asistencia del personal según el flujo de auditoría del encargado.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar Estado</label>
            <select 
              value={estado} 
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="PRESENTE">Presente</option>
              <option value="AUSENTE">Ausente</option>
              <option value="EN_ESPERA">En Espera</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Justificación / Descripción</label>
            <textarea 
              rows="3"
              placeholder="Describa el motivo de la modificación manual..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
            >
              Confirmar Cambio
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};