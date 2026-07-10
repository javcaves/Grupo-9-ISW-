// src/components/modals/CambiarMiPasswordModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { FormContainer } from "../Formulario";
import { UsuarioService } from "../../api/usuario.service";
import PasswordInput from "../PasswordInput";
import { useToast } from "../../context/ToastContext";

export default function CambiarMiPasswordModal({ isOpen, onClose }) {
  const toast = useToast();
  const [passwordActual, setPasswordActual]           = useState("");
  const [passwordNueva, setPasswordNueva]             = useState("");
  const [confirmarPasswordNueva, setConfirmarPasswordNueva] = useState("");
  const [guardando, setGuardando]                     = useState(false);
  const [error, setError]                             = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setPasswordActual("");
    setPasswordNueva("");
    setConfirmarPasswordNueva("");
    setError(null);
  }, [isOpen]);

  const validar = () => {
    if (!passwordActual) return "Debes ingresar tu contraseña actual.";

    if (!passwordNueva || passwordNueva.length < 6 || passwordNueva.length > 8) {
      return "La nueva contraseña debe tener entre 6 y 8 caracteres.";
    }
    if (passwordNueva !== confirmarPasswordNueva) {
      return "Las contraseñas nuevas no coinciden.";
    }
    if (passwordNueva === passwordActual) {
      return "La nueva contraseña debe ser distinta a la actual.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msgError = validar();
    if (msgError) {
      setError(msgError);
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      await UsuarioService.cambiarMiPassword(passwordActual, passwordNueva);
      toast.success("¡Tu contraseña se actualizó correctamente!");
      onClose();
    } catch (err) {
      console.error("CambiarMiPasswordModal:", err);
      setError(err?.message || "No se pudo cambiar la contraseña. Verifica que la contraseña actual sea correcta.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cambiar Contraseña">
      <FormContainer
        title="Cambiar mi contraseña"
        description="Ingresa tu contraseña actual y la nueva que quieras usar."
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText={guardando ? "Guardando..." : "Cambiar contraseña"}
      >
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
          <PasswordInput
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
          <PasswordInput
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Entre 6 y 8 caracteres"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
          <PasswordInput
            value={confirmarPasswordNueva}
            onChange={(e) => setConfirmarPasswordNueva(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </FormContainer>
    </Modal>
  );
}
