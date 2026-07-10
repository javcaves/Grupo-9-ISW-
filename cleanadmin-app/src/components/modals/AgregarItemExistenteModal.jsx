import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { ItemsService } from '../../api/items.service';
import { extraerData } from '../../utils/apiResponse';

const FORM_INICIAL = {
  id_item: '',
  cantidad_inicial: 0,
  stock_minimo: 0,
};

/**
 * A diferencia de CrearItemProyectoModal, este modal NO crea un Item
 * nuevo en el catálogo -- vincula uno que ya existe a este proyecto,
 * creando su fila en ItemProyecto (cantidad, stock_minimo, activo=true).
 *
 * NOTA: si el item ya tuvo un vínculo previo con este proyecto y fue
 * desvinculado (activo=false), el backend debería reactivar esa misma
 * fila en vez de intentar crear una nueva (la PK es id_item+id_proyecto).
 */
export default function AgregarItemExistenteModal({ isOpen, onClose, proyecto, itemsEnProyecto = [], actualizarLista }) {
  const [catalogo, setCatalogo] = useState([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [paso, setPaso] = useState('form'); // 'form' | 'exito'
  const [enviando, setEnviando] = useState(false);

  const idsEnProyecto = new Set(itemsEnProyecto.map((i) => i.id_item));
  const catalogoDisponible = catalogo.filter((i) => !idsEnProyecto.has(i.id_item));

  useEffect(() => {
    if (!isOpen) return;
    setCargandoCatalogo(true);
    ItemsService.listar()
      .then((res) => setCatalogo(extraerData(res) ?? res?.data ?? res ?? []))
      .catch(() => setCatalogo([]))
      .finally(() => setCargandoCatalogo(false));
  }, [isOpen]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleClose = () => {
    setFormData(FORM_INICIAL);
    setPaso('form');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      await ItemsService.vincularProyecto(proyecto.id_proyecto, {
        id_item: Number(formData.id_item),
        cantidad: Number(formData.cantidad_inicial) || 0,
        stock_minimo: Number(formData.stock_minimo) || 0,
      });

      actualizarLista?.();
      setPaso('exito');
    } catch (error) {
      console.error(error);
      const detalle = error?.response?.data?.errorDetails || error?.data?.errorDetails || error?.message;
      alert(detalle || 'Ocurrió un error, revisa la consola.');
    } finally {
      setEnviando(false);
    }
  };

  if (paso === 'exito') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Item vinculado">
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-emerald-600 text-xl" />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            ¡Item vinculado con éxito!
          </p>
          <p className="text-xs px-4" style={{ color: 'var(--text-secondary)' }}>
            Quedó disponible en este proyecto con el stock y stock mínimo indicados.
          </p>
          <button
            onClick={handleClose}
            className="mt-5 px-5 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Item Existente">
      <FormContainer
        title="Vincular item del catálogo"
        description="Elige un item que ya existe en el catálogo general y define su stock y stock mínimo para este proyecto."
        onSubmit={handleSubmit}
        onCancel={handleClose}
        submitText={enviando ? 'Vinculando...' : 'Vincular item'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <select
              name="id_item" value={formData.id_item} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={cargandoCatalogo}
            >
              <option value="">{cargandoCatalogo ? 'Cargando...' : 'Selecciona...'}</option>
              {catalogoDisponible.map((i) => (
                <option key={i.id_item} value={i.id_item}>
                  {i.nombre}{i.unidad_medida ? ` (${i.unidad_medida.charAt(0)}${i.unidad_medida.slice(1).toLowerCase()})` : ''}
                </option>
              ))}
            </select>
            {!cargandoCatalogo && catalogoDisponible.length === 0 && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                No hay items del catálogo disponibles para vincular -- ya están todos en este proyecto.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock inicial en este proyecto</label>
            <input
              type="number" name="cantidad_inicial" min="0" value={formData.cantidad_inicial} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
            <input
              type="number" name="stock_minimo" min="0" value={formData.stock_minimo} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Si el stock cae a este nivel o menos, el item aparecerá en "Bajo Stock".
            </p>
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}
