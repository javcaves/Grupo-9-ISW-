import React, { useState } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { AsignacionService } from '../../api/asignacion.service';

export default function AsignarTarea({ isOpen, onClose, tareasPendientes, empleados, actualizarLista }) {
  const [formData, setFormData] = useState({ id_tarea:'', id_empleado: '', tipoAsignacion: 'PROGRAMADA' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await AsignacionService.crear(formData);
      
      actualizarLista();
      onClose();
      setFormData({ id_tarea: '', id_empleado: '', tipoAsignacion: 'PROGRAMADA' });
    } catch (error) {
      console.error("Error al asignar la tarea:",error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignación de Personal">
      <FormContainer
        title="Asignar Tarea"
        description="Delega una tarea pendiente a un empleado de turno."
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Asignar Empleado"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarea Programada Pendiente</label>
            <select name="id_tarea" value={formData.id_tarea} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Seleccione una tarea...</option>
              {tareasPendientes?.map(tarea => (
                <option key={tarea.id} value={tarea.id}>{tarea.nombre_actividad} ({tarea.hora})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empleado a Asignar</label>
            <select name="id_empleado" value={formData.id_empleado} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Selecciona empleado...</option>
              {empleados?.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nombre} ({emp.certificacion || 'General'})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Asignación</label>
            <select name="tipoAsignacion" value={formData.tipoAsignacion} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="PROGRAMADA">Programada</option>
              <option value="REASIGNADA">Reasignada</option>
            </select>
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}