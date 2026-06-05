import React, { useState } from 'react';
import { FormContainer } from '../components/Formulario.jsx';

export const FormularioTurno = ({ onSuccess }) => {
  const [turnoData, setTurnoData] = useState({ ingreso: '', salida: '', descripcion: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enviando a la API de Turnos:", turnoData);
    // Lógica para enviar al backend...
    onSuccess?.();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <FormContainer
        title="Crear Nuevo Turno"
        description="Configura los horarios y detalles del nuevo turno para el proyecto."
        submitText="Crear Turno"
        onSubmit={handleSubmit}
        onCancel={() => console.log("Operación cancelada")}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Ingreso</label>
            <input 
              type="time" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={turnoData.ingreso}
              onChange={(e) => setTurnoData({...turnoData, ingreso: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Salida</label>
            <input 
              type="time" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={turnoData.salida}
              onChange={(e) => setTurnoData({...turnoData, salida: e.target.value})}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea 
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: Turno de guardia nocturna..."
            value={turnoData.descripcion}
            onChange={(e) => setTurnoData({...turnoData, descripcion: e.target.value})}
          />
        </div>
      </FormContainer>
    </div>
  );
};