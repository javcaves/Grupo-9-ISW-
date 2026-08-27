import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { ItemsService } from '../../api/items.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const TIPOS_ITEM = ['MAQUINARIA', 'HERRAMIENTA', 'UTENSILIO', 'PRODUCTO'];
const UNIDADES_MEDIDA = ['LITROS', 'UNIDADES', 'KILOS', 'SACOS', 'BOLSAS', 'METROS'];
const TIPOS_CONTROL = ['CONSUMO', 'PRESTAMO'];

export default function EditarItemProyectoModal({ isOpen, onClose, proyecto, item, actualizarLista }) {
  const toast = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    unidad_medida: '',
    control: '',
    cantidad_actual: 0,
    stock_minimo: 0,
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
        cantidad_actual: item.cantidad_actual ?? 0,
        stock_minimo: item.stock_minimo ?? 0,
      });
    }
  }, [item, isOpen]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevaCantidad = Number(formData.cantidad_actual);
    const nuevoMinimo   = Number(formData.stock_minimo);

    if (!Number.isFinite(nuevaCantidad) || nuevaCantidad < 0 ||
        !Number.isFinite(nuevoMinimo)   || nuevoMinimo   < 0) {
      toast.error('La cantidad y el stock mínimo deben ser números válidos (0 o más).');
      return;
    }

    setEnviando(true);
    try {
      // 1. Datos del catálogo (nombre, tipo, unidad, control) — afectan al
      //    ítem en general, en todos los proyectos.
      await ItemsService.actualizar(item.id_item, {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        unidad_medida: formData.unidad_medida,
        control: formData.control,
      });

      // 2. Corrección de stock de ESTE proyecto (por si se contó mal). Solo
      //    si cambió la cantidad o el mínimo. Va por el endpoint de auditoría,
      //    que registra el ajuste como movimiento (ENTRADA/SALIDA por la
      //    diferencia) y actualiza la última revisión a la fecha de hoy.
      const idProyecto = item.id_proyecto ?? proyecto?.id_proyecto;
      const cambioStock =
        nuevaCantidad !== Number(item.cantidad_actual ?? 0) ||
        nuevoMinimo   !== Number(item.stock_minimo ?? 0);

      if (cambioStock && idProyecto) {
        await ItemsService.auditarInventario(idProyecto, {
          id_emisor: user?.id_usuario || user?.id,
          items: [
            { id_item: item.id_item, cantidad: nuevaCantidad, stock_minimo: nuevoMinimo },
          ],
        });
      }

      actualizarLista?.();
      toast.success('¡Ítem actualizado con éxito!');
      onClose();
    } catch (error) {
      console.error(error);
      const detalle = error?.response?.data?.errorDetails || error?.data?.errorDetails || error?.message;
      toast.error(detalle || 'Error al actualizar el ítem. Revisa la consola.');
    } finally {
      setEnviando(false);
    }
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Ítem">
      <FormContainer
        title="Modificar datos del ítem"
        description="Actualiza la información base del ítem y, si hiciste un reconteo, corrige el stock de este proyecto."
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

          {/* ── Corrección de stock de este proyecto ─────────────────── */}
          <div className="pt-2 mt-2 border-t border-gray-200">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-500 mb-1">
              Stock en este proyecto
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Si corriges la cantidad (por un reconteo), se registra un movimiento de ajuste
              y se actualiza la última revisión a hoy.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad actual</label>
                <input
                  type="number" name="cantidad_actual" min="0" value={formData.cantidad_actual} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                <input
                  type="number" name="stock_minimo" min="0" value={formData.stock_minimo} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}
