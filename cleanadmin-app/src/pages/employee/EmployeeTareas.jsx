import { useEffect, useState } from "react";

import { Card } from "../../components/Card";
import { TareaService } from "../../api/tareas.service";
import { UsuarioService } from "../../api/usuario.service";
import { ItemsService } from "../../api/items.service";

export default function EmployeeTareas() {

  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    assigned: 0,
    completed: 0,
  });

  const [list, setList] = useState([]);
  const [team, setTeam] = useState([]);
  const [inventory, setInventory] = useState([]);

  // =========================
  // CARGA DE DATOS
  // =========================
  useEffect(() => {

    async function cargarTareas() {

      try {

        console.log("[Tareas] Cargando tareas...");

        const tareasRes = await TareaService.listar();
        console.log("[Tareas] response tareas =>", tareasRes);

        const tareas = tareasRes?.data ?? tareasRes ?? [];

        setList(tareas);

        // =========================
        // SUMMARY
        // =========================
        const assigned = tareas.length;
        const completed = tareas.filter(t => t.estado === "Completada").length;

        setSummary({
          assigned,
          completed,
        });

        // =========================
        // TEAM (usuarios)
        // =========================
        console.log("[Tareas] Cargando equipo...");

        const usuariosRes = await UsuarioService.buscar({});
        console.log("[Tareas] usuarios =>", usuariosRes);

        const usuarios = usuariosRes?.data ?? usuariosRes ?? [];

        setTeam(
          usuarios.map(u => ({
            id: u.id_usuario,
            name: u.nombre,
            role: u.rol,
          }))
        );

        // =========================
        // INVENTARIO
        // =========================
        console.log("[Tareas] Cargando inventario...");

        const itemsRes = await ItemsService.listarActivos();
        console.log("[Tareas] inventario =>", itemsRes);

        const items = itemsRes?.data ?? itemsRes ?? [];

        setInventory(
          items.map(i => ({
            id: i.id,
            name: i.nombre,
            stock: i.stock,
          }))
        );

      } catch (err) {
        console.error("[Tareas] Error cargando datos:", err);
      } finally {
        setLoading(false);
      }

    }

    cargarTareas();

  }, []);

  // =========================
  // UI HELPERS
  // =========================
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-600";
      case "Media":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pendiente":
        return "bg-red-100 text-red-600";
      case "En Progreso":
        return "bg-blue-100 text-blue-600";
      case "Completada":
        return "bg-green-100 text-green-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getTaskIcon = (title) => {
    if (!title) return "fa-list-check";

    const t = title.toLowerCase();

    if (t.includes("baño")) return "fa-broom";
    if (t.includes("insumo")) return "fa-boxes-stacked";
    if (t.includes("basura")) return "fa-trash";

    return "fa-list-check";
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return <div className="p-4">Cargando tareas...</div>;
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
      <Card title="Resumen" icon="fa-chart-simple">

        <div className="grid grid-cols-2 gap-3">

          <div className="p-4 rounded-2xl border">
            <div className="text-sm mb-1">Asignadas</div>
            <div className="text-2xl font-bold">{summary.assigned}</div>
          </div>

          <div className="p-4 rounded-2xl border">
            <div className="text-sm mb-1">Completadas</div>
            <div className="text-2xl font-bold">{summary.completed}</div>
          </div>

        </div>

      </Card>

      {/* TAREAS */}
      <Card title="Mis Tareas" icon="fa-list-check">

        <div className="space-y-4">

          {list.length === 0 && (
            <div className="text-center text-gray-500">
              No hay tareas asignadas
            </div>
          )}

          {list.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl border"
            >

              <div className="flex items-center gap-3 mb-4">

                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
                  }}
                >
                  <i className={`fas ${getTaskIcon(task.title)}`} />
                </div>

                <div>
                  <h3 className="font-semibold">{task.title ?? "Sin título"}</h3>
                  <p className="text-sm text-gray-500">
                    {task.estimatedMinutes ?? "--"} min
                  </p>
                </div>

              </div>

              <p className="text-sm mb-4 text-gray-500">
                {task.description ?? "Sin descripción"}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">

                <span className={`px-3 py-2 rounded-full text-xs font-semibold ${getPriorityClass(task.priority)}`}>
                  Prioridad {task.priority ?? "--"}
                </span>

                <span className={`px-3 py-2 rounded-full text-xs font-semibold ${getStatusClass(task.status)}`}>
                  {task.status ?? "Sin estado"}
                </span>

              </div>

              <button
                className="w-full rounded-xl py-3 text-white font-semibold"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
                }}
                onClick={() => console.log("[Tareas] ver detalle:", task)}
              >
                Ver Detalle
              </button>

            </div>
          ))}

        </div>

      </Card>

      {/* EQUIPO */}
      <Card title="Equipo de Trabajo" icon="fa-users">

        <div className="space-y-3">

          {team.length === 0 && (
            <div className="text-center text-gray-500">
              Sin equipo cargado
            </div>
          )}

          {team.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-4 border rounded-2xl">
              <i className="fas fa-user text-violet-500" />

              <div>
                <div className="font-medium">{member.name ?? "--"}</div>
                <div className="text-sm text-gray-500">{member.role ?? "--"}</div>
              </div>
            </div>
          ))}

        </div>

      </Card>

      {/* INVENTARIO */}
      <Card title="Inventario Relacionado" icon="fa-box">

        <div className="space-y-3">

          {inventory.length === 0 && (
            <div className="text-center text-gray-500">
              Sin inventario relacionado
            </div>
          )}

          {inventory.map((item) => (
            <div key={item.id} className="flex justify-between p-4 border rounded-2xl">

              <div className="flex items-center gap-3">
                <i className="fas fa-box text-violet-500" />
                <span>{item.name ?? "--"}</span>
              </div>

              <span className="font-semibold">{item.stock ?? 0}</span>

            </div>
          ))}

        </div>

      </Card>

    </div>
  );
}