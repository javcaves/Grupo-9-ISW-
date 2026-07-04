import React, { useState } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { ActividadesService } from '../../api/actividades.service';

export default function CrearActividad({ isOpen, onClose, categorias, actualizarLista }) {
  const [formData, setFormData] = useState({ nombre: '', id_categoria: '', descripcion: '', recurrencia: 'DIARIA' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ActividadesService.crear(formData);
      
      alert("¡Actividad base creada con éxito!");
      actualizarLista();
      onClose();
      setFormData({ nombre: '', id_categoria: '', descripcion: '', recurrencia: 'DIARIA' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestión de Actividades">
      <FormContainer
        title="Crear Actividad"
        description="Define una actividad específica dentro de una categoría."
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Crear Actividad"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Actividad</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Asociada</label>
            <select name="id_categoria" value={formData.id_categoria} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Selecciona una categoría...</option>
              {categorias?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
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