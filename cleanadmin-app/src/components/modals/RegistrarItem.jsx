import React, { useState } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';


export default function RegistrarItem({ isOpen, onClose, actualizarLista }) {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    control: '',
    stock: 0,
    unidadMedida: '',
    alertaStock: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // await ItemService.crear(formData);
      console.log("Datos enviados:", formData);
      actualizarLista();
      onClose();
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Formulario de Ítem" variant="center">
      <FormContainer
        title="Registrar Nuevo Ítem"
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Guardar Ítem"
      >
        <div className="space-y-4">
          {/* Nombre item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Ítem</label>
            <input type="text" name="nombre" placeholder="Ej. Fregadora Industrial" 
              value={formData.nombre} onChange={handleChange} required 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select name="tipo" value={formData.tipo} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">Seleccione...</option>
                <option value="maquinaria">Maquinaria</option>
                <option value="herramienta">Herramienta</option>
              </select>
            </div>
            {/* Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Control</label>
              <select name="control" value={formData.control} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="consumo">Consumo</option>
                <option value="inventario">Inventario</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (Stock)</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            {/* Unidad de Medida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
              <select name="unidadMedida" value={formData.unidadMedida} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="unidades">Unidades</option>
                <option value="kg">Kilogramos</option>
              </select>
            </div>
          </div>

          {/* Alerta Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alerta de Stock Mínimo</label>
            <input type="number" name="alertaStock" placeholder="Ej. 5" 
              value={formData.alertaStock} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}