import React, { useState } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { ItemsService } from '../../api/items.service';
import { ProyectoService } from '../../api/proyecto.service';
import { useAuth } from '../../context/AuthContext';
import { extraerListado } from '../../utils/apiResponse';
import { useToast } from "../../context/ToastContext";

const TIPOS_ITEM = ['MAQUINARIA', 'HERRAMIENTA', 'UTENSILIO', 'PRODUCTO'];
const UNIDADES_MEDIDA = ['LITROS', 'UNIDADES', 'KILOS', 'SACOS', 'BOLSAS', 'METROS'];
const TIPOS_CONTROL = ['CONSUMO', 'PRESTAMO'];

const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  tipo: '',
  unidad_medida: '',
  control: '',
  cantidad: 1,
};

/**
 * Un ENCARGADO no puede crear items directamente: al enviar este formulario
 * se le envía como SOLICITUD (tipo_movimiento: 'SOLICITUD') en vez de
 * ItemsService.crear(). SUPERVISOR/ADMIN/ROOT sí crean directo.
 *
 * Por eso el formulario cambia de campos según el rol: ENCARGADO solo
 * propone nombre + cantidad (tipo/unidad_medida/control los define quien
 * apruebe, en SolicitudResolverModal); el resto completa el item
 * completo del catálogo.
 */
export default function CrearItemModal({ isOpen, onClose, actualizarLista }) {
  const toast = useToast();
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
        // ENCARGADO: buscamos su proyecto asignado (mismo patrón que ProyectosView.jsx)
        const resProyectos = await ProyectoService.listar();
        const miProyecto = extraerListado(resProyectos)[0];

        if (!miProyecto) {
          toast.warning('No tienes un proyecto asignado, no se puede enviar la solicitud.');
          setEnviando(false);
          return;
        }

        await ItemsService.registrarMovimiento({
          tipo_movimiento: 'SOLICITUD',
          item_sugerido: formData.nombre,
          descripcion: formData.descripcion,
          cantidad: Number(formData.cantidad),
          id_proyecto: miProyecto.id_proyecto,
          id_emisor: user.id_usuario || user.id,
        });
      } else {
        await ItemsService.crear({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          tipo: formData.tipo,
          unidad_medida: formData.unidad_medida,
          control: formData.control,
        });
        actualizarLista?.();
      }

      setPaso('exito');
    } catch (error) {
      console.error(error);
      const detalle = error?.response?.data?.errorDetails || error?.data?.errorDetails || error?.message;
      toast.error(detalle || 'Ocurrió un error, revisa la consola.');
    } finally {
      setEnviando(false);
    }
  };

  if (paso === 'exito') {
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
              ? 'El supervisor de tu proyecto y los administradores fueron notificados. Te avisaremos por notificación cuando la revisen.'
              : 'El item ya está disponible en el catálogo general.'}
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Item">
      <FormContainer
        title={esEncargado ? 'Solicitar nuevo item' : 'Crear item de catálogo'}
        description={
          esEncargado
            ? 'Como Encargado, tu solicitud debe ser aprobada por un Supervisor o Administrador antes de existir el item.'
            : 'El item queda disponible de inmediato en el catálogo general.'
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
                type="number" name="cantidad" min="1" value={formData.cantidad} onChange={handleChange} required
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
            </>
          )}
        </div>
      </FormContainer>
    </Modal>
  );
}
