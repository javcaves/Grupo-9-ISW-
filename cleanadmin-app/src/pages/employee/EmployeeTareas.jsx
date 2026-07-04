import { useEffect, useState } from "react";

import { Card } from "../../components/Card";
import { TareaService } from "../../api/tareas.service";
import { ItemsService } from "../../api/items.service";

export default function EmployeeTareas() {

  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    assigned: 0,
    completed: 0,
  });

  const [list, setList] = useState([]);
  const [inventory, setInventory] = useState([]);

  // =========================
  // CARGA DE DATOS
  // =========================
  useEffect(() => {

    async function cargarTareas() {

      try {

        console.log("[Tareas] Cargando tus asignaciones...");

        // Llamamos al nuevo endpoint refactorizado que trae el array de AsignacionTarea
        const tareasRes = await TareaService.misTareas();
        console.log("[Tareas] response tareas =>", tareasRes);


        const asignaciones = tareasRes?.data ?? tareasRes ?? [];
        console.log(JSON.stringify(asignaciones[0], null, 2));
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

        // =========================
        // INVENTARIO
        // =========================
        console.log("[Tareas] Cargando inventario...");

        const itemsRes = await ItemsService.listarActivos().catch(err => {
          console.error("❌ Error cargando inventario:", err);
          return [];
        });
        console.log("[Tareas] inventario =>", itemsRes);

        const items = itemsRes?.data ?? itemsRes ?? [];

        console.log("IDs tareas:", asignaciones.map(a => a.id_asignacion));
console.log("IDs items:", items.map(i => i.id_item));

console.log(items);
console.log(items[0]);


        setInventory(
          items.map(i => ({
            id: i.id_item,
            name: i.nombre,
            stock: i.stock,
          }))
        );

      } catch (err) {
        console.error("[Tareas] Error cargando datos en la pantalla:", err);
      } finally {
        setLoading(false);
      }

    }

    cargarTareas();

  }, []);

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
            const companeros = item.companeros ?? [];
            const nombreActividad = actividad?.descripcion_esp ?? "Tarea sin descripción definida";
            const horaProgramada = tareaInterna?.hora ? tareaInterna.hora.substring(0, 5) : "--:--";
            const fechaProgramada = tareaInterna?.fecha ?? "--";
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

                    <div className="mb-4">
  <div className="text-xs font-semibold text-gray-500 mb-2">
    Equipo asignado
  </div>

  {companeros.length === 0 ? (
    <div className="text-xs text-gray-400 italic">
      Trabajarás solo en esta tarea.
    </div>
  ) : (
    <div className="space-y-2">
      {companeros.map(persona => (
        <div
          key={persona.id_usuario}
          className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 border"
        >
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
            <i className="fas fa-user" />
          </div>

          <div>
            <div className="text-sm font-medium">
              {persona.nombre} {persona.apellido}
            </div>

            <div className="text-xs text-gray-500">
              {persona.rol}
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

                <button
                  className="w-full rounded-xl py-3 text-white font-semibold cursor-pointer hover:opacity-95 transition-opacity text-sm"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
                  }}
                  onClick={() => console.log("[Tareas] Ver detalle completo del nodo:", item)}
                >
                  Ver Detalle
                </button>
              </div>
            );
          })}

        </div>
      </Card>

      {/* INVENTARIO */}
      <Card title="Inventario Relacionado" icon="fa-box">
        <div className="space-y-3">
          {inventory.length === 0 && (
            <div className="text-center text-gray-500 py-2 text-sm">
              Sin inventario activo registrado en el sistema
            </div>
          )}

          {inventory.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 border rounded-2xl bg-white/40">
              <div className="flex items-center gap-3 text-sm">
                <i className="fas fa-box text-blue-500" />
                <span>{item.name ?? "--"}</span>
              </div>
              <span className={`px-2.5 py-0.5 font-bold rounded-lg text-xs ${item.stock > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {item.stock ?? 0} Unidades
              </span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}