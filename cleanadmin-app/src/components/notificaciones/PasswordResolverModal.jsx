// src/components/notificaciones/PasswordResolverModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { UsuarioService } from '../../api/usuario.service';
import PasswordInput from '../PasswordInput';
import { useNotificaciones } from '../../context/NotificacionesContext';
import { extraerData } from '../../utils/apiResponse';

export default function PasswordResolverModal({ isOpen, idUsuario, onClose }) {
  const { refrescar } = useNotificaciones();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || idUsuario == null) return;

    let cancelado = false;
    setNuevaPassword('');
    setConfirmarPassword('');
    setError(null);

    (async () => {
      setCargando(true);
      setNoEncontrado(false);
      setUsuario(null);
      try {
        const res = await UsuarioService.obtenerPorId(idUsuario);
        if (!cancelado) setUsuario(extraerData(res));
      } catch (err) {
        console.error('Error al cargar usuario:', err);
        if (!cancelado) setNoEncontrado(true);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => { cancelado = true; };
  }, [isOpen, idUsuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (nuevaPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);
    try {
      await UsuarioService.resetearPassword(idUsuario, nuevaPassword);
      await refrescar();
      onClose();
    } catch (err) {
      console.error('Error al resetear contraseña:', err);
      setError(err.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recuperación de contraseña" icon="fa-key">
      {cargando && (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
          Cargando usuario...
        </p>
      )}

      {!cargando && noEncontrado && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No se pudo cargar el usuario que solicitó el reseteo.
          </p>
          <button onClick={onClose} className="mt-4 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200">
            Cerrar
          </button>
        </div>
      )}

      {!cargando && usuario && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="rounded-2xl p-4 border space-y-2"
            style={{ background: 'var(--bg-color)', borderColor: 'var(--border-color)' }}
          >
            <Dato label="Nombre" valor={`${usuario.nombre} ${usuario.apellido}`} />
            <Dato label="RUT" valor={usuario.rut} />
            {usuario.email && <Dato label="Email" valor={usuario.email} />}
          </div>

          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Asigna una contraseña provisional. Debes comunicársela al usuario fuera de la app —
            este gestor no le notifica nada de vuelta.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Nueva contraseña
            </label>
            <PasswordInput
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Confirmar contraseña
            </label>
            <PasswordInput
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {enviando ? 'Guardando...' : 'Asignar contraseña provisional'}
          </button>
        </form>
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