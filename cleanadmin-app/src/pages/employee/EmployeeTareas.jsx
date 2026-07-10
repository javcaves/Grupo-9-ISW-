import { useEffect, useState } from "react";

import { Card } from "../../components/Card";
import { TareaService } from "../../api/tareas.service";
import { formatearFecha } from "../../utils/formatters";

export default function EmployeeTareas() {

  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    assigned: 0,
    completed: 0,
  });

  const [list, setList] = useState([]);

  // Id de la tarea que se está marcando como completada en este momento
  // (para deshabilitar solo ese botón y evitar doble clic, no toda la lista).
  const [completandoId, setCompletandoId] = useState(null);

  // =========================
  // CARGA DE DATOS
  // =========================
  async function cargarTareas({ mostrarCargando = true } = {}) {

    try {

      if (mostrarCargando) console.log("[Tareas] Cargando tus asignaciones...");

      // Llamamos al nuevo endpoint refactorizado que trae el array de AsignacionTarea
      const tareasRes = await TareaService.misTareas();

      const asignaciones = tareasRes?.data ?? tareasRes ?? [];
      setList(asignaciones);

      // =========================
      // SUMMARY (Basado en el estado de la tarea vinculada)
      // =========================
      const assigned = asignaciones.length;
      const completed = asignaciones.filter(a => a.tarea?.estado === "FINALIZADA").length;

      setSummary({
        assigned,
        completed,
      });

    } catch (err) {
      console.error("[Tareas] Error cargando datos en la pantalla:", err);
    } finally {
      setLoading(false);
    }

  }

  useEffect(() => {
    cargarTareas();
  }, []);

  // Refresco automático en segundo plano
  useEffect(() => {
    const INTERVALO_REFRESCO_MS = 20000;
    const intervalo = setInterval(() => {
      cargarTareas({ mostrarCargando: false });
    }, INTERVALO_REFRESCO_MS);
    return () => clearInterval(intervalo);
  }, []);

  // Marca la tarea como completada y refresca la lista + el resumen.
  async function marcarComoCompletada(idTarea) {
    setCompletandoId(idTarea);
    try {
      await TareaService.completar(idTarea);
      await cargarTareas();
    } catch (err) {
      console.error("[Tareas] Error al completar la tarea:", err);
      alert(err?.message || "No se pudo marcar la tarea como completada.");
    } finally {
      setCompletandoId(null);
    }
  }

  // =========================
  // UI HELPERS (Adaptados a los Enums reales)
  // =========================
  const getStatusClass = (status) => {
    switch (status) {
      case "PLANIFICADA":
        return "bg-amber-100 text-amber-700 border border-amber-300";
      case "EN_PROCESO":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "FINALIZADA":
        return "bg-green-100 text-green-700 border border-green-300";
      case "INCOMPLETA":
      case "CANCELADA":
        return "bg-red-100 text-red-700 border border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  const getTaskIcon = (title) => {
    if (!title) return "fa-list-check";

    const t = title.toLowerCase();

    if (t.includes("baño") || t.includes("limpieza") || t.includes("aseo")) return "fa-broom";
    if (t.includes("insumo") || t.includes("material") || t.includes("bodega")) return "fa-boxes-stacked";
    if (t.includes("basura") || t.includes("desecho")) return "fa-trash";
    if (t.includes("mantencion") || t.includes("reparar") || t.includes("electrica")) return "fa-screwdriver-wrench";

    return "fa-list-check";
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return <div className="p-4 text-center font-medium">Cargando tareas asignadas...</div>;
  }

  return (
    <div className="p-4 space-y-4 pb-24">

      {/* HEADER */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10">
        <h1 className="text-2xl font-bold" style={{ color: "var(--card-title)" }}>
          Tareas
        </h1>
        <p className="mt-2" style={{ color: "var(--card-subtitle)" }}>
          Gestiona tus actividades y avances diarios
        </p>
      </Card>

      {/* RESUMEN */}
      <Card title="Resumen de Gestión" icon="fa-chart-simple">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl border bg-white/40">
            <div className="text-xs mb-1 opacity-70">Asignadas</div>
            <div className="text-2xl font-bold">{summary.assigned}</div>
          </div>

          <div className="p-4 rounded-2xl border bg-white/40">
            <div className="text-xs mb-1 opacity-70">Completadas</div>
            <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
          </div>
        </div>
      </Card>

      {/* TAREAS */}
      <Card title="Mis Tareas" icon="fa-list-check">
        <div className="space-y-4">

          {list.length === 0 && (
            <div className="text-center text-gray-500 py-4 text-sm">
              No tienes tareas asignadas para el día de hoy
            </div>
          )}

          {list.map((item) => {
            // Desestructuramos con seguridad las capas anidadas que creamos en el backend
            const tareaInterna = item.tarea;
            const actividad = tareaInterna?.actividad;
            const nombreActividad = actividad?.descripcion_esp ?? "Tarea sin descripción definida";
            const horaProgramada = tareaInterna?.hora ? tareaInterna.hora.substring(0, 5) : "--:--";
            const fechaProgramada = tareaInterna?.fecha ? formatearFecha(tareaInterna.fecha) : "--";
            const estadoActual = tareaInterna?.estado ?? "PLANIFICADA";
            const comentarioAsignador = tareaInterna?.comentario ?? "Sin observaciones";

            return (
              <div
                key={item.id_asignacion}
                className="p-4 rounded-2xl border bg-white/30 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                    style={{
                      background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
                    }}
                  >
                    <i className={`fas ${getTaskIcon(nombreActividad)}`} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-base leading-tight">
                      {nombreActividad}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Programada: {fechaProgramada} a las {horaProgramada} hrs
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-dashed mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Nota de Planificación</div>
                  <p className="text-xs text-gray-600 italic">
                    "{comentarioAsignador}"
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-full text-xs font-semibold">
                    <i className="fas fa-bullseye mr-1"></i> {item.tipo_asignacion ?? "PROGRAMADA"}
                  </span>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(estadoActual)}`}>
                    {estadoActual}
                  </span>
                </div>

                {estadoActual === "FINALIZADA" ? (
                  <div className="mt-2 w-full rounded-xl py-3 text-center text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                    <i className="fas fa-circle-check mr-2"></i>
                    Tarea completada
                  </div>
                ) : ["CANCELADA", "INCOMPLETA"].includes(estadoActual) ? null : estadoActual !== "EN_PROCESO" ? (
                  <div className="mt-2 w-full rounded-xl py-3 text-center text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <i className="fas fa-clock mr-2"></i>
                    Aún no comienza el horario de esta tarea
                  </div>
                ) : (
                  <button
                    className="mt-2 w-full rounded-xl py-3 font-semibold text-sm border transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      color: "#059669",
                      borderColor: "#a7f3d0",
                      background: "#ecfdf5",
                    }}
                    disabled={completandoId === tareaInterna?.id_tarea}
                    onClick={() => marcarComoCompletada(tareaInterna?.id_tarea)}
                  >
                    {completandoId === tareaInterna?.id_tarea ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Marcando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check mr-2"></i>
                        Marcar como Completada
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}

        </div>
      </Card>

    </div>
  );
}