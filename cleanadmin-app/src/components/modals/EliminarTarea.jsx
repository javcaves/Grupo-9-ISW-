import React, { useState } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { TareaService } from '../../api/tarea.service';

export default function CancelarTarea({ isOpen, onClose, tareaSeleccionada, actualizarLista }) {
  const [comentario, setComentario] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await TareaService.cancelar(tareaSeleccionada?.id, comentario);

      actualizarLista();
      onClose();
      setComentario('');
    } catch (error) {
      console.error("Error al cancelar la tarea:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atención: Cancelar Tarea">
      <FormContainer
        title="Justificar Cancelación"
        description={`Estás a punto de cancelar la tarea: ${tareaSeleccionada?.nombre}. Esta acción requiere una justificación obligatoria.`}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Confirmar Cancelación"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-600 mb-1">Motivo de la cancelación *</label>
            <textarea 
              value={comentario} 
              onChange={(e) => setComentario(e.target.value)} 
              rows="4"
              required
              placeholder="Ej: Empleado no se presentó, falta de insumos, etc."
              className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            ></textarea>
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}