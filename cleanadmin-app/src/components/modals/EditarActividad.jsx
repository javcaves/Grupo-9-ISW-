import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { ActividadesService } from '../../api/actividades.service';

export default function EditarActividad({ isOpen, onClose, categorias, actualizarLista, actividadActual }) {
  const [formData, setFormData] = useState({
    descripcion_esp: '',
    id_cat: '',
    recurrencia: 'DIARIA'
  });

  // Cuando el modal se abre, pre-llenamos el formulario con los datos de la actividad
  useEffect(() => {
    if (actividadActual) {
      setFormData({
        descripcion_esp: actividadActual.descripcion_esp || '',
        id_cat: actividadActual.categoria?.id_cat || '', 
        recurrencia: actividadActual.recurrencia || 'DIARIA'
      });
    }
  }, [actividadActual]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const datosProcesados = {
      ...formData,
      id_cat: parseInt(formData.id_cat, 10) // Conversión segura para PostgreSQL
    };

    try {
      await ActividadesService.actualizar(actividadActual.id_act, datosProcesados);
      alert("¡Actividad actualizada con éxito!");
      actualizarLista();
      onClose();
    } catch (error) {
      console.error("Error al editar la actividad:", error);
      alert("Hubo un error al actualizar la actividad.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestión de Actividades">
      <FormContainer
        title="Editar Actividad"
        description="Modifica los detalles de esta actividad base del proyecto."
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Guardar Cambios"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Actividad</label>
            <input type="text" name="descripcion_esp" value={formData.descripcion_esp} onChange={handleChange} required 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Asociada</label>
            <select name="id_cat" value={formData.id_cat} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Selecciona una categoría...</option>
              {categorias?.map(cat => (
                <option key={cat.id_cat} value={cat.id_cat}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia / Recurrencia</label>
            <select name="recurrencia" value={formData.recurrencia} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="DIARIA">Diaria</option>
              <option value="SEMANAL">Semanal</option>
              <option value="MENSUAL">Mensual</option>
              <option value="UNICA">Única</option>
            </select>
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}