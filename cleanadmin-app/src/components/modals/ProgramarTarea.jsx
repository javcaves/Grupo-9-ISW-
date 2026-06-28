import React, { useState } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { TareaService } from '../../api/tarea.service';

export default function ProgramarTarea({ isOpen, onClose, actividades, actualizarLista }) {
  const [formData, setFormData] = useState({ id_actividad: '', fecha: '', hora: '', comentario: '', estado: 'PLANIFICADA' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await TareaService.crear(formData);
      
      alert("¡Tarea programada con éxito!");
      actualizarLista();
      onClose();

      setFormData({ id_actividad: '', fecha: '', hora: '', comentario: '', estado: 'PLANIFICADA' });
    } catch (error) {
      console.error("Error al programar la tarea", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Planificación operativa">
      <FormContainer
        title="Programar Tarea"
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Programar"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actividad a realizar</label>
            <select name="id_actividad" value={formData.id_actividad} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Selecciona actividad...</option>
              {actividades?.map(act => <option key={act.id} value={act.id}>{act.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
              <input type="time" name="hora" value={formData.hora} onChange={handleChange} required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentario / Detalles</label>
            <textarea name="comentario" value={formData.comentario} onChange={handleChange} rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}