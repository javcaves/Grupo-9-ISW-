import React, { useState } from 'react';
import { Modal } from '../Modal';
import { ProyectoService } from '../../api/proyecto.service';
import { useToast } from "../../context/ToastContext";

const ETIQUETAS_ESTADO = {
  EN_PREPARACION: 'En Preparación',
  EN_CURSO: 'En Curso',
  FINALIZADO: 'Finalizado',
};

export default function CambiarFaseProyectoModal({ isOpen, onClose, proyecto, nuevoEstado, direccion, onSuccess }) {
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);

  if (!proyecto || !nuevoEstado) return null;

  const esAvance = direccion === 'avanzar';
  const tituloAccion = esAvance ? 'Avanzar de fase' : 'Anular avance de fase';

  const handleConfirmar = async () => {
    setEnviando(true);
    try {
      // ── ÚNICA LÍNEA A AJUSTAR SI TU SERVICIO TIENE OTRO MÉTODO ──
      await ProyectoService.actualizar(proyecto.id_proyecto, { estado: nuevoEstado });

      await onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al cambiar la fase del proyecto:', error);
      toast.error(error?.message || 'No se pudo actualizar el estado del proyecto.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tituloAccion}>
      <div className="space-y-4 py-2">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {esAvance
            ? `Vas a cambiar el proyecto "${proyecto.nombre_proy}" de `
            : `Vas a anular el avance del proyecto "${proyecto.nombre_proy}", volviendo de `}
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {ETIQUETAS_ESTADO[proyecto.estado] ?? proyecto.estado}
          </span>
          {' a '}
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {ETIQUETAS_ESTADO[nuevoEstado] ?? nuevoEstado}
          </span>
          .
        </p>

        {!esAvance && (
          <p className="text-xs rounded-xl p-3 bg-amber-50 text-amber-700">
            Esto revierte el estado del proyecto. Úsalo solo para corregir un avance hecho por error.
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            disabled={enviando}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            disabled={enviando}
            onClick={handleConfirmar}
            // Avanzar usa el botón primario del tema (--button-bg es un
            // gradiente, por eso "background" y no "backgroundColor").
            // Anular se deja en ámbar fijo -- es una acción de corrección,
            // no la acción principal del tema, así que no comparte var().
            style={esAvance ? { background: 'var(--button-bg)', color: 'var(--button-text)' } : undefined}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-transform hover:scale-[1.02] ${
              esAvance ? '' : 'text-white bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {enviando ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
