import React, { useState } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { ItemsService } from '../../api/items.service';
import { useAuth } from '../../context/AuthContext';
import { extraerData } from '../../utils/apiResponse';

const TIPOS_ITEM = ['MAQUINARIA', 'HERRAMIENTA', 'UTENSILIO', 'PRODUCTO'];
const UNIDADES_MEDIDA = ['LITROS', 'UNIDADES', 'KILOS', 'SACOS', 'BOLSAS', 'METROS'];
const TIPOS_CONTROL = ['CONSUMO', 'PRESTAMO'];

const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  tipo: '',
  unidad_medida: '',
  control: '',
  cantidad_inicial: 1,
};

/**
 * Mismo botón "Crear Item" para TODOS los roles -- lo que cambia es qué
 * pasa al enviar:
 *
 * - ENCARGADO: nunca crea el item directo. Se manda como
 *   MovimientoInventario tipo 'SOLICITUD' (item_sugerido = nombre),
 *   queda PENDIENTE, y notifica a SUPERVISOR del proyecto + ADMIN/ROOT.
 *   Ellos pueden aprobar (con los datos que el ENCARGADO propuso, o
 *   cambiándolos) o rechazar desde SolicitudResolverModal.
 * - SUPERVISOR/ADMIN/ROOT: crea el item directo en el catálogo y, si
 *   cantidad_inicial > 0, lo deja vinculado a ESTE proyecto de inmediato
 *   (vía un MovimientoInventario tipo ENTRADA).
 */
export default function CrearItemProyectoModal({ isOpen, onClose, proyecto, actualizarLista }) {
  const { user } = useAuth();
  const esEncargado = user?.rol === 'ENCARGADO';

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [paso, setPaso] = useState('form'); // 'form' | 'exito'
  const [enviando, setEnviando] = useState(false);

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
      if (esEncargado) {
        await ItemsService.registrarMovimiento({
          tipo_movimiento: 'SOLICITUD',
          item_sugerido: formData.nombre,
          descripcion: formData.descripcion,
          cantidad: Number(formData.cantidad_inicial) || 1,
          id_proyecto: proyecto.id_proyecto,
          id_emisor: user.id_usuario || user.id,
        });
      } else {
        const resItem = await ItemsService.crear({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          tipo: formData.tipo,
          unidad_medida: formData.unidad_medida,
          control: formData.control,
        });

        const nuevoItem = extraerData(resItem);
        const cantidadInicial = Number(formData.cantidad_inicial) || 0;

        if (cantidadInicial > 0 && nuevoItem?.id_item) {
          await ItemsService.registrarMovimiento({
            tipo_movimiento: 'ENTRADA',
            id_item: nuevoItem.id_item,
            id_proyecto: proyecto.id_proyecto,
            id_emisor: user.id_usuario || user.id,
            cantidad: cantidadInicial,
            descripcion: 'Carga inicial al crear el item',
          });
        }

        actualizarLista?.();
      }

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
    const conStock = !esEncargado && Number(formData.cantidad_inicial) > 0;
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={esEncargado ? 'Solicitud enviada' : 'Item creado'}>
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-emerald-600 text-xl" />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {esEncargado ? '¡Solicitud enviada con éxito!' : '¡Item creado con éxito!'}
          </p>
          <p className="text-xs px-4" style={{ color: 'var(--text-secondary)' }}>
            {esEncargado
              ? 'El supervisor de este proyecto y los administradores fueron notificados. Podrán aceptarla tal cual, ajustar los datos, o rechazarla -- te llegará una notificación con la decisión.'
              : conStock
                ? `Quedó disponible en el catálogo y vinculado a este proyecto con ${formData.cantidad_inicial} de stock inicial.`
                : 'Quedó disponible en el catálogo. No aparecerá en este proyecto hasta que le registres un movimiento.'}
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Item">
      <FormContainer
        title={esEncargado ? 'Solicitar nuevo item' : 'Crear item de catálogo'}
        description={
          esEncargado
            ? 'Tu solicitud debe ser aprobada por un Supervisor o Administrador antes de existir el item. Ellos pueden aceptar tus datos tal cual, cambiarlos, o rechazarla.'
            : 'Se crea en el catálogo general y, si indicas cantidad inicial, queda vinculado de inmediato a este proyecto.'
        }
        onSubmit={handleSubmit}
        onCancel={handleClose}
        submitText={enviando ? 'Enviando...' : (esEncargado ? 'Enviar solicitud' : 'Crear item')}
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

          {esEncargado ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad solicitada</label>
              <input
                type="number" name="cantidad_inicial" min="1" value={formData.cantidad_inicial} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          ) : (
            <>
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
                  {UNIDADES_MEDIDA.map((u) => <option key={u} value={u}>{u}</option>)}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad inicial en este proyecto
                </label>
                <input
                  type="number" name="cantidad_inicial" min="0" value={formData.cantidad_inicial} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Déjalo en 0 si solo quieres agregarlo al catálogo sin stock en este proyecto todavía.
                </p>
              </div>
            </>
          )}
        </div>
      </FormContainer>
    </Modal>
  );
}
