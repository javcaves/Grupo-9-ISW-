import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { ItemsService } from '../../api/items.service';
import { useToast } from '../../context/ToastContext';

const TIPOS_ITEM = ['MAQUINARIA', 'HERRAMIENTA', 'UTENSILIO', 'PRODUCTO'];
const UNIDADES_MEDIDA = ['LITROS', 'UNIDADES', 'KILOS', 'SACOS', 'BOLSAS', 'METROS'];
const TIPOS_CONTROL = ['CONSUMO', 'PRESTAMO'];

export default function EditarItemProyectoModal({ isOpen, onClose, item, actualizarLista }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    unidad_medida: '',
    control: '',
  });
  const [enviando, setEnviando] = useState(false);

  // Cuando se abre el modal y detecta un ítem, llena el formulario automáticamente
  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        tipo: item.tipo || '',
        unidad_medida: item.unidad_medida || '',
        control: item.control || '',
      });
    }
  }, [item, isOpen]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      // Usamos la función de actualizar del servicio
      await ItemsService.actualizar(item.id_item, formData);
      actualizarLista?.();
      toast.success("¡Ítem actualizado con éxito!");
      onClose(); // Cierra el modal si fue exitoso
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Error al actualizar el ítem. Revisa la consola.');
    } finally {
      setEnviando(false);
    }
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Ítem">
      <FormContainer
        title="Modificar datos del ítem"
        description="Actualiza la información base de este ítem."
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText={enviando ? 'Guardando...' : 'Guardar cambios'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              name="tipo" value={formData.tipo} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecciona...</option>
              {TIPOS_ITEM.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de medida</label>
            <select
              name="unidad_medida" value={formData.unidad_medida} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecciona...</option>
              {UNIDADES_MEDIDA.map((u) => (
                <option key={u} value={u}>{u.charAt(0)}{u.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Control</label>
            <select
              name="control" value={formData.control} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecciona...</option>
              {TIPOS_CONTROL.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}
