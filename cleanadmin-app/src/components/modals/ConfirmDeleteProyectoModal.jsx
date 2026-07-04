// src/components/modals/ConfirmDeleteProyectoModal.jsx
import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { ProyectoService } from "../../api/proyecto.service";

export default function ConfirmDeleteProyectoModal({ isOpen, onClose, proyecto, onSuccess }) {
  const [paso, setPaso]             = useState(1);
  const [texto, setTexto]           = useState("");
  const [eliminando, setEliminando] = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (isOpen) {
      setPaso(1);
      setTexto("");
      setError(null);
    }
  }, [isOpen, proyecto]);

  if (!proyecto) return null;

  const nombreConfirmacion = proyecto.nombre_proy ?? "";
  const coincide = texto.trim() === nombreConfirmacion;

  const handleEliminar = async () => {
    if (!coincide) return;
    setEliminando(true);
    setError(null);
    try {
      await ProyectoService.eliminar(proyecto.id_proyecto);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("ConfirmDeleteProyectoModal:", err);
      setError(err?.response?.data?.message ?? "No se pudo eliminar el proyecto.");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Eliminar Proyecto">
      {paso === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Estás a punto de desactivar el proyecto{" "}
            <span className="font-semibold text-gray-900">{nombreConfirmacion}</span>.
            Esta acción es un <strong>soft delete</strong>: el proyecto pasará a estar inactivo
            pero no se elimina de forma permanente de la base de datos.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={() => setPaso(2)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Para confirmar, escribe el nombre exacto del proyecto:{" "}
            <span className="font-semibold text-gray-900">{nombreConfirmacion}</span>
          </p>
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder={nombreConfirmacion}
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setPaso(1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Atrás
            </button>
            <button
              onClick={handleEliminar}
              disabled={!coincide || eliminando}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {eliminando ? "Eliminando..." : "Eliminar proyecto"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}