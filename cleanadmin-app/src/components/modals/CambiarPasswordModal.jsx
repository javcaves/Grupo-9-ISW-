// src/components/modals/CambiarPasswordModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { FormContainer } from "../Formulario";
import { UsuarioService } from "../../api/usuario.service";
import PasswordInput from "../PasswordInput";

export default function CambiarPasswordModal({ isOpen, onClose, usuario, onSuccess }) {
  const [password, setPassword]                 = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [guardando, setGuardando]                = useState(false);
  const [error, setError]                        = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setPassword("");
    setConfirmarPassword("");
    setError(null);
  }, [isOpen]);

  const validar = () => {
    if (!password || password.length < 6 || password.length > 8) {
      return "La contraseña debe tener entre 6 y 8 caracteres.";
    }
    if (password !== confirmarPassword) {
      return "Las contraseñas no coinciden.";
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
      await UsuarioService.cambiarPassword(usuario.id_usuario, password);
      alert("¡Contraseña actualizada correctamente!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("CambiarPasswordModal:", err);
      setError(err?.message || "Ocurrió un error al actualizar la contraseña.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cambiar Contraseña">
      <FormContainer
        title={`Restablecer contraseña${usuario ? ` de ${usuario.nombre ?? ""} ${usuario.apellido ?? ""}` : ""}`}
        description="Úsalo cuando la persona haya olvidado su contraseña. Se reemplazará de inmediato."
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Entre 6 y 8 caracteres"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
          <PasswordInput
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </FormContainer>
    </Modal>
  );
}
