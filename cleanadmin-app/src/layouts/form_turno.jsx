import React, { useState } from 'react';
import { FormContainer } from '../components/Formulario.jsx';

export const FormularioTurno = ({ onSuccess }) => {
  const [turnoData, setTurnoData] = useState({ 
    nombre: '', 
    ingreso: '', 
    salida: '', 
    descripcion: '',
    empleados: '1' // ID por defecto para prueba rápida
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Transformar los empleados de un string ("1, 2") a un array de objetos
      const empleadosArray = turnoData.empleados
        .split(',')
        .map(id => ({ id_empleado: parseInt(id.trim(), 10) }))
        .filter(emp => !isNaN(emp.id_empleado));

      if (empleadosArray.length === 0) {
        throw new Error("Debes ingresar al menos un ID de empleado válido.");
      }

      // 2. Preparar el payload con el formato exacto que pide el backend (Joi)
      const payload = {
        id_proyecto: 1, // ⚠️ HARDCODEADO: Aquí debes pasar el ID del proyecto actual cuando lo tengas
        nombre: turnoData.nombre,
        hora_ingreso: turnoData.ingreso,
        hora_salida: turnoData.salida,
        descripcion: turnoData.descripcion,
        empleados: empleadosArray
      };

      // 3. Hacer la petición POST
      const response = await fetch("http://localhost:3000/api/turno/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Importante para enviar el token JWT en las cookies
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errorDetails || data.message || "Error al crear el turno");
      }

      console.log("Turno creado exitosamente:", data);
      onSuccess?.(); // Cierra el modal
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <FormContainer
        title="Crear Nuevo Turno"
        description="Configura los horarios y detalles del nuevo turno para el proyecto."
        submitText={loading ? "Creando..." : "Crear Turno"}
        onSubmit={handleSubmit}
        onCancel={() => onSuccess?.()}
      >
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Turno</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: Turno Mañana"
            value={turnoData.nombre}
            onChange={(e) => setTurnoData({...turnoData, nombre: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">IDs de Empleados (Separados por coma)</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 1, 3, 5"
            value={turnoData.empleados}
            onChange={(e) => setTurnoData({...turnoData, empleados: e.target.value})}
            required
          />
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