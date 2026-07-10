// src/components/modals/SolicitarCorreccionAsistenciaModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { AsistenciaService } from "../../api/asistencia.service";

const OPCIONES_ESTADO = [
  { value: "", label: "No cambiar el estado" },
  { value: "PRESENTE", label: "Presente" },
  { value: "ATRASO", label: "Atraso" },
  { value: "FALTA_JUSTIFICADA", label: "Falta Justificada" },
];

export default function SolicitarCorreccionAsistenciaModal({ isOpen, registro, onClose, onSuccess }) {
  const [estadoSolicitado, setEstadoSolicitado] = useState("");
  const [horaIngreso, setHoraIngreso] = useState("");
  const [horaEgreso, setHoraEgreso] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setEstadoSolicitado("");
      setHoraIngreso("");
      setHoraEgreso("");
      setMotivo("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !registro) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (motivo.trim().length < 5) {
      setError("Cuéntanos brevemente por qué solicitas la corrección (mínimo 5 caracteres).");
      return;
    }
    if (!estadoSolicitado && !horaIngreso && !horaEgreso) {
      setError("Debes proponer al menos un cambio: estado, hora de ingreso u hora de egreso.");
      return;
    }

    setEnviando(true);
    try {
      await AsistenciaService.crearSolicitudCorreccion({
        id_asistencia: registro.id_asistencia,
        estado_solicitado: estadoSolicitado || undefined,
        hora_ingreso_solicitada: horaIngreso || undefined,
        hora_egreso_solicitada: horaEgreso || undefined,
        motivo: motivo.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error al crear solicitud de corrección:", err);
      setError(err.message || "No se pudo enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitar corrección de asistencia" icon="fa-pen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1 text-sm text-gray-500">
          <p><strong>Fecha:</strong> {registro.fecha}</p>
          <p><strong>Estado actual:</strong> {registro.estado}</p>
          <p><strong>Entrada actual:</strong> {registro.hora_ingreso ?? "--:--"} · <strong>Salida actual:</strong> {registro.hora_egreso ?? "--:--"}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Estado propuesto (opcional)</label>
          <select
            value={estadoSolicitado}
            onChange={(e) => setEstadoSolicitado(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-gray-50"
          >
            {OPCIONES_ESTADO.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Hora ingreso propuesta</label>
            <input
              type="time"
              value={horaIngreso}
              onChange={(e) => setHoraIngreso(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Hora salida propuesta</label>
            <input
              type="time"
              value={horaEgreso}
              onChange={(e) => setHoraEgreso(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Motivo</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg bg-gray-50"
            placeholder="Ej: Marqué salida más tarde porque me quedé terminando una tarea."
          />
        </div>

        <div className="flex justify-end gap-3 mt-2 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
            disabled={enviando}
          >
            {enviando && <i className="fas fa-spinner fa-spin" />}
            Enviar solicitud
          </button>
        </div>
      </form>
    </Modal>
  );
}