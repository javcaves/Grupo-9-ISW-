import React from "react";
import { Modal } from "../Modal";

export default function ConfirmarEliminacion({
  isOpen,
  onClose,
  tituloElemento,
  idElemento,
  servicioEliminar,
  actualizarLista,
}) {
  const handleEliminar = async () => {
    try {
      await servicioEliminar(idElemento);

      actualizarLista();
      onClose();
    } catch (error) {
      console.error("Error al eliminar el elemento:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Eliminación">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 text-3xl">
          <i className="fas fa-exclamation-triangle"></i>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">¿Estás seguro?</h2>
        <p className="text-gray-600 mb-6">
          Estás a punto de eliminar <strong>{tituloElemento}</strong>.
          <br /> Esta acción lo deshabilitará del sistema.
        </p>

        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleEliminar}
            className="px-5 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            Sí, Eliminar
          </button>
        </div>
      </div>
    </Modal>
  );
}
