import React, { useState } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { TareaService } from '../../api/tareas.service';
import { useToast } from "../../context/ToastContext";

export default function ProgramarTarea({ isOpen, onClose, actividades, actualizarLista }) {
  const toast = useToast();
  const [formData, setFormData] = useState({ id_act: '', fecha: '', hora: '', comentario: ''});

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const datosProcesados = { ...formData };
    datosProcesados.id_act = parseInt(datosProcesados.id_act, 10);
    
    try {
      await TareaService.crear(datosProcesados);

      toast.success("¡Tarea programada con éxito!");
      actualizarLista();
      onClose();
      setFormData({ id_act: '', fecha: '', hora: '', comentario: ''});
    } catch (error) {
      console.error("Error al programar la tarea", error);
      toast.error(`No se pudo programar la tarea:\n\n${error.message}`);
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
            <select name="id_act" value={formData.id_act} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Selecciona actividad...</option>
              {actividades?.map(act => <option key={act.id_act} value={act.id_act}>{act.descripcion_esp}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required
                min={new Date().toISOString().split("T")[0]}
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
              maxLength={255} placeholder="Ej: Revisar especialmente el sector de bodega norte"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.comentario.length}/255 caracteres</p>
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}