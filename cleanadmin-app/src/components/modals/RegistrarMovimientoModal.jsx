import React, { useState } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { ItemsService } from '../../api/items.service';
import { useAuth } from '../../context/AuthContext';

const FORM_INICIAL = {
  id_item: '',
  tipo_movimiento: 'ENTRADA',
  cantidad: 1,
  descripcion: '',
};

/**
 * Reglas de negocio (confirmadas):
 * - Cualquier rol, incluido ENCARGADO, puede registrar ENTRADA/SALIDA
 *   directo para un item YA vinculado al proyecto -- sin aprobación.
 * - Pedir MÁS STOCK de un item que ya existe (pero no alcanza) pasa por
 *   SOLICITUD -- esa pestaña solo se muestra a ENCARGADO, ya que
 *   SUPERVISOR/ADMIN/ROOT pueden sumar stock directo desde acá mismo
 *   (pestaña "Movimiento directo" > ENTRADA).
 *
 * Proponer un ITEM NUEVO vive en CrearItemProyectoModal (el botón
 * "Crear Item"), no acá -- para evitar dos caminos distintos hacia lo
 * mismo, este modal solo trabaja con items que YA están en `items`.
 *
 * `items`: lista de items YA vinculados a este proyecto (viene de
 * ItemsService.listar({ id_proyecto }) en el padre).
 */
export default function RegistrarMovimientoModal({ isOpen, onClose, proyecto, items = [], actualizarLista }) {
  const { user } = useAuth();
  const esEncargado = user?.rol === 'ENCARGADO';

  const [modo, setModo] = useState('directo'); // 'directo' | 'solicitud'
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [paso, setPaso] = useState('form'); // 'form' | 'exito'
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setFormData(FORM_INICIAL);
  };

  const handleClose = () => {
    setFormData(FORM_INICIAL);
    setModo('directo');
    setPaso('form');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const base = {
        id_proyecto: proyecto.id_proyecto,
        id_emisor: user.id_usuario || user.id,
        id_item: Number(formData.id_item),
        cantidad: Number(formData.cantidad),
        descripcion: formData.descripcion,
      };

      if (modo === 'directo') {
        await ItemsService.registrarMovimiento({
          ...base,
          tipo_movimiento: formData.tipo_movimiento, // ENTRADA | SALIDA
        });
        actualizarLista?.();
      } else {
        await ItemsService.registrarMovimiento({
          ...base,
          tipo_movimiento: 'SOLICITUD',
        });
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
    const esSolicitud = modo === 'solicitud';
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={esSolicitud ? 'Solicitud enviada' : 'Movimiento registrado'}>
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-emerald-600 text-xl" />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {esSolicitud ? '¡Solicitud enviada con éxito!' : '¡Movimiento registrado con éxito!'}
          </p>
          <p className="text-xs px-4" style={{ color: 'var(--text-secondary)' }}>
            {esSolicitud
              ? 'El supervisor de este proyecto y los administradores fueron notificados. Te avisaremos por notificación cuando la revisen.'
              : 'El stock del proyecto ya quedó actualizado.'}
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Movimiento" variant="wide">
      {esEncargado && (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => cambiarModo('directo')}
            className={`flex-1 text-sm font-semibold px-3 py-2 rounded-xl transition-colors ${
              modo === 'directo' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Movimiento directo
          </button>
          <button
            type="button"
            onClick={() => cambiarModo('solicitud')}
            className={`flex-1 text-sm font-semibold px-3 py-2 rounded-xl transition-colors ${
              modo === 'solicitud' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Pedir más stock
          </button>
        </div>
      )}

      <FormContainer
        title={modo === 'directo' ? 'Entrada / salida de stock' : 'Pedir más stock'}
        description={
          modo === 'directo'
            ? 'Registra el ingreso o consumo de un item que ya está en este proyecto. Se aplica de inmediato.'
            : 'Debe ser aprobada por un Supervisor o Administrador antes de sumarse al stock.'
        }
        onSubmit={handleSubmit}
        onCancel={handleClose}
        submitText={enviando ? 'Enviando...' : (modo === 'directo' ? 'Registrar movimiento' : 'Enviar solicitud')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <select
              name="id_item" value={formData.id_item} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecciona un item del proyecto...</option>
              {items.map((it) => (
                <option key={it.id_item} value={it.id_item}>
                  {it.nombre} (stock actual: {it.cantidad_actual ?? 0})
                </option>
              ))}
            </select>
            {items.length === 0 && (
              <p className="text-xs mt-1 text-amber-600">
                Este proyecto todavía no tiene items vinculados -- usa "Crear Item" primero.
              </p>
            )}
          </div>

          {modo === 'directo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento</label>
              <select
                name="tipo_movimiento" value={formData.tipo_movimiento} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {modo === 'directo' ? 'Cantidad' : 'Cantidad solicitada'}
            </label>
            <input
              type="number" name="cantidad" min="1" value={formData.cantidad} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <textarea
              name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}
