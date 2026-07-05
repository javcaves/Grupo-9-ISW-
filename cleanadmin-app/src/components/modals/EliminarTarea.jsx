import React, { useState } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { TareaService } from '../../api/tareas.service';

export default function EliminarTarea({ isOpen, onClose, tareaSeleccionada, actualizarLista }) {
  const [comentario, setComentario] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación de seguridad en el frontend
    if (comentario.trim().length < 5) {
      alert("La justificación debe tener al menos 5 caracteres.");
      return;
    }

    try {
      // Si ya está en proceso, pasa a INCOMPLETA. Si no, se CANCELA.
      const estadoFinal = tareaSeleccionada?.estado === "EN_PROCESO" ? "INCOMPLETA" : "CANCELADA";

      const payload = {
        estado: estadoFinal,
        comentario: comentario
      };

      await TareaService.cancelar(tareaSeleccionada?.id_tarea, payload);

      alert(`¡La tarea ha sido marcada como ${estadoFinal} con éxito!`);
      actualizarLista();
      onClose();
      setComentario('');
    } catch (error) {
      console.error("Error al cancelar la tarea:", error);
      // Extraemos el error del backend para mostrarlo en pantalla
      const msj = error.response?.data?.message || error.message;
      alert(`Error del servidor: ${msj}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Atención: ${tareaSeleccionada?.estado === "EN_PROCESO" ? "Marcar Incompleta" : "Cancelar Tarea"}`}>
      <FormContainer
        title="Justificar Acción"
        description={`Estás a punto de alterar la tarea: ${tareaSeleccionada?.actividad?.descripcion_esp || "Sin nombre asignado"}. Esta acción requiere una justificación obligatoria.`}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Confirmar"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-600 mb-1">Motivo / Justificación *</label>
            <textarea 
              value={comentario} 
              onChange={(e) => setComentario(e.target.value)} 
              rows="4"
              required
              minLength={5}
              placeholder="Ej: Empleado no se presentó, falta de insumos, etc. (Mín. 5 caracteres)"
              className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            ></textarea>
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}