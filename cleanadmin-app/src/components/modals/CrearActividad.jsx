import React, { useState } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { ActividadesService } from '../../api/actividades.service';

export default function CrearActividad({ isOpen, onClose, categorias, actualizarLista,idProyecto }) {
  const [formData, setFormData] = useState({ descripcion_esp: '', id_cat: '', recurrencia: 'DIARIA' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const datosProcesados = {
      ...formData,
      id_proyecto: parseInt(idProyecto, 10)
    };
    
    try {
      await ActividadesService.crear(datosProcesados);
      
      alert("¡Actividad base creada con éxito!");
      actualizarLista();
      onClose();
      setFormData({ descripcion_esp: '', id_cat: '', recurrencia: 'DIARIA' });
    } catch (error) {
      console.error(error);
      alert(`No se pudo crear la actividad:\n\n${error.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestión de Actividades">
      <FormContainer
        title="Crear Actividad"
        description="Define una actividad específica dentro de una categoría."
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Crear Actividad">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Actividad</label>
            <input type="text" name="descripcion_esp" value={formData.descripcion_esp} onChange={handleChange} required
              maxLength={255} placeholder="Ej: Inventario y conteo de herramientas en bodega"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.descripcion_esp.length}/255 caracteres</p>
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