// src/components/notificaciones/SolicitudResolverModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { ItemsService } from '../../api/items.service';
import { useNotificaciones } from '../../context/NotificacionesContext';
import { extraerListado, extraerData } from '../../utils/apiResponse';
import { useToast } from "../../context/ToastContext";

const TIPOS_ITEM = ['MAQUINARIA', 'HERRAMIENTA', 'UTENSILIO', 'PRODUCTO'];
const UNIDADES_MEDIDA = ['LITROS', 'UNIDADES', 'KILOS', 'SACOS', 'BOLSAS', 'METROS'];
const TIPOS_CONTROL = ['CONSUMO', 'PRESTAMO'];

/**
 * NOTA: el backend (solicitudResolucionValidation) no tiene un campo de
 * "motivo de rechazo" persistente todavía -- por eso este modal no ofrece
 * ese campo. Si lo agregan al backend (columna + validación), es agregar
 * un textarea acá y mandarlo en el payload de rechazar.
 */
export default function SolicitudResolverModal({ isOpen, idMovimiento, onClose }) {
  const toast = useToast();
  const { refrescar } = useNotificaciones();

  const [solicitud, setSolicitud] = useState(null);
  const [itemExistente, setItemExistente] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [noEncontrada, setNoEncontrada] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    unidad_medida: '',
    control: '',
  });

  useEffect(() => {
    if (!isOpen || idMovimiento == null) return;

    let cancelado = false;

    (async () => {
      setCargando(true);
      setNoEncontrada(false);
      setSolicitud(null);
      setItemExistente(null);

      try {
        const res = await ItemsService.listarSolicitudesPendientes();
        const pendientes = extraerListado(res);
        const match = pendientes.find((m) => m.id_mov === idMovimiento);

        if (cancelado) return;

        if (!match) {
          setNoEncontrada(true);
          return;
        }

        setSolicitud(match);

        if (match.id_item) {
          // item ya existente en el catalogo: lo mostramos solo lectura
          const resItem = await ItemsService.obtener(match.id_item);
          if (!cancelado) setItemExistente(extraerData(resItem));
        } else {
          // item nuevo: pre-llenamos el nombre propuesto, el resto lo define quien aprueba
          setFormData({
            nombre: match.item_sugerido || '',
            tipo: '',
            unidad_medida: '',
            control: '',
          });
        }
      } catch (error) {
        console.error('Error al cargar la solicitud:', error);
        setNoEncontrada(true);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => { cancelado = true; };
  }, [isOpen, idMovimiento]);

  const esItemNuevo = solicitud && !solicitud.id_item;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resolver = async (decision) => {
    if (decision === 'APROBADO' && esItemNuevo) {
      if (!formData.nombre || !formData.tipo || !formData.unidad_medida || !formData.control) {
        toast.error('Completa nombre, tipo, unidad de medida y control antes de aprobar un item nuevo.');
        return;
      }
    }

    setEnviando(true);
    try {
      const payload = decision === 'APROBADO' && esItemNuevo
        ? { decision, ...formData }
        : { decision };

      await ItemsService.resolverSolicitud(idMovimiento, payload);
      await refrescar();
      onClose();
    } catch (error) {
      console.error('Error al resolver la solicitud:', error);
      toast.error('No se pudo resolver la solicitud. Revisa la consola para más detalle.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resolver solicitud">
      {cargando && (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
          Cargando solicitud...
        </p>
      )}

      {!cargando && noEncontrada && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Esta solicitud ya no está pendiente (probablemente alguien más ya la resolvió).
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      )}

      {!cargando && solicitud && (
        <div className="space-y-4">
          <div
            className="rounded-2xl p-4 border space-y-2"
            style={{ background: 'var(--bg-color)', borderColor: 'var(--border-color)' }}
          >
            <Dato label="Proyecto" valor={`#${solicitud.id_proyecto}`} />
            <Dato label="Solicitado por" valor={`Usuario #${solicitud.id_emisor}`} />
            <Dato label="Cantidad solicitada" valor={solicitud.cantidad} />
            {solicitud.descripcion && <Dato label="Descripción" valor={solicitud.descripcion} />}
          </div>

          {itemExistente && (
            <div
              className="rounded-2xl p-4 border space-y-2"
              style={{ background: 'var(--bg-color)', borderColor: 'var(--border-color)' }}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">Item existente</p>
              <Dato label="Nombre" valor={itemExistente.nombre} />
              <Dato label="Tipo" valor={itemExistente.tipo} />
              <Dato label="Unidad de medida" valor={<span className="inline-block lowercase first-letter:uppercase">{itemExistente.unidad_medida}</span>} />
            </div>
          )}

          {esItemNuevo && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                Item nuevo — completa antes de aprobar
              </p>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Tipo
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Selecciona...</option>
                  {TIPOS_ITEM.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Unidad de medida
                </label>
                <select
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Selecciona...</option>
                  {UNIDADES_MEDIDA.map((u) => (
                    <option key={u} value={u}>{u.charAt(0)}{u.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Control
                </label>
                <select
                  name="control"
                  value={formData.control}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Selecciona...</option>
                  {TIPOS_CONTROL.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              disabled={enviando}
              onClick={() => resolver('RECHAZADO')}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
            >
              Rechazar
            </button>
            <button
              disabled={enviando}
              onClick={() => resolver('APROBADO')}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Dato({ label, valor }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{valor}</span>
    </div>
  );
}
