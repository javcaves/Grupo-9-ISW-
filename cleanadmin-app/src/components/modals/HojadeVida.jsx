import React, { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { EvaluacionService } from "../../api/evaluacion.service";
import { formatearTimestamp } from "../../utils/formatters";
import { useToast } from "../../context/ToastContext";

export default function HojaDeVida({ isOpen, onClose, empleado }) {
  const toast = useToast();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  async function cargar() {
    if (!empleado?.id_usuario) return;
    setLoading(true);
    try {
      const res = await EvaluacionService.listarPorEmpleado(empleado.id_usuario);
      setEvaluaciones(res?.data ?? res ?? []);
    } catch (error) {
      console.error("Error al cargar hoja de vida:", error);
      setEvaluaciones([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (isOpen) cargar(); }, [isOpen, empleado?.id_usuario]);

  async function handleRevocar(evaluacion) {
    if (!confirm("¿Revocar esta evaluación? Quedará fuera de la hoja de vida, pero no se borra del sistema.")) return;
    try {
      await EvaluacionService.revocar(evaluacion.id_evaluacion);
      cargar();
    } catch (error) {
      console.error("Error al revocar evaluación:", error);
      toast.error(`No se pudo revocar:\n\n${error.message}`);
    }
  }

  const total = evaluaciones.length;
  const cumplidas = evaluaciones.filter(e => e.cumplio).length;
  const promedio = total
    ? (evaluaciones.reduce((sum, e) => sum + (e.calificacion ?? 0), 0) / total).toFixed(1)
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Hoja de Vida — ${empleado?.nombre ?? ""} ${empleado?.apellido ?? ""}`} variant="wide">
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        </div>
      ) : total === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-10">
          Todavía no hay evaluaciones de desempeño registradas para este empleado.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-slate-700">{total}</div>
              <div className="text-xs text-gray-500 mt-1">Evaluaciones totales</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{cumplidas}/{total}</div>
              <div className="text-xs text-gray-500 mt-1">Tareas cumplidas</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{promedio} / 5</div>
              <div className="text-xs text-gray-500 mt-1">Calidad promedio</div>
            </div>
          </div>

          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden max-h-[50vh] overflow-y-auto">
            {evaluaciones.map(ev => (
              <li key={ev.id_evaluacion} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {ev.tarea?.actividad?.descripcion_esp || "Tarea sin nombre"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatearTimestamp(ev.fecha_evaluacion)} · Evaluado por {ev.evaluador?.nombre} {ev.evaluador?.apellido}
                    </p>
                    {ev.comentario && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{ev.comentario}"</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ev.cumplio ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                      {ev.cumplio ? "Cumplió" : "No cumplió"}
                    </span>
                    <span className="text-xs font-semibold text-amber-600">Calidad: {ev.calificacion}/5</span>
                    <button
                      onClick={() => handleRevocar(ev)}
                      className="text-[11px] font-semibold text-gray-400 hover:text-red-600 hover:underline"
                    >
                      Revocar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button onClick={onClose} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
