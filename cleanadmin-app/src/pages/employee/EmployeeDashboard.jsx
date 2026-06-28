import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Hook Importado

import { Card } from "../../components/Card";
import { AuthService } from "../../api/auth.service";
import { ProyectoService } from "../../api/proyecto.service";
import { TurnoService } from "../../api/turno.service";
import { TareaService } from "../../api/tareas.service";
import { AsistenciaService } from "../../api/asistencia.service";

export default function EmployeeDashboard() {
  const navigate = useNavigate(); // <-- ¡INICIALIZACIÓN CRÍTICA AGREGADA!

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const [shift, setShift] = useState(null);
  const [today, setToday] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [nextProject, setNextProject] = useState(null);

  useEffect(() => {
    async function cargarDashboard() {
      try {
        console.log("🚀 Cargando dashboard...");

        // =====================================================================
        // 1. USUARIO
        // =====================================================================
        const me = await AuthService.me();
        console.log("👤 Usuario:", me);

        const user = me?.user;
        if (!user) {
          console.warn("⚠️ No hay usuario autenticado.");
          return;
        }

        const nombre = user.nombre ?? "Empleado";
        const empleado = {
          id: user.id_usuario,
          name: nombre,
          initials: nombre.split(" ").filter(Boolean).map(w => w[0]).join("").substring(0, 2).toUpperCase(),
          role: user.rol,
          email: user.correo
        };
        setEmployee(empleado);

        // =====================================================================
        // 2. PROYECTO + TAREAS EN PARALELO
        // =====================================================================
        console.log("📂 Solicitando proyectos y tareas en paralelo...");
        const [proyectosRes, tareasRes] = await Promise.all([
          ProyectoService.listar().catch(err => {
            console.error("❌ Error proyectos:", err);
            return [];
          }),
          TareaService.misTareas().catch(err => {
            console.error("❌ Error tareas:", err);
            return { data: [] };
          })
        ]);

        const proyectos = Array.isArray(proyectosRes) ? proyectosRes : (proyectosRes?.data ?? []);
        const tareas = tareasRes?.data ?? [];

        const proyectoActual = proyectos[0] ?? null;
        console.log("🏢 Proyecto Detectado Localmente:", proyectoActual);
        setNextProject(proyectoActual);

        const total = tareas.length;
        const completadas = tareas.filter(t => t.estado === "FINALIZADA").length;

        setTasks({
          assigned: total,
          completed: completadas,
          progress: total === 0 ? 0 : Math.round((completadas / total) * 100)
        });

        // =====================================================================
        // 3. TURNO
        // =====================================================================
        let turnoActual = null;
        if (proyectoActual?.id_proyecto) {
          console.log(`⏱️ Buscando turnos para el proyecto ID: ${proyectoActual.id_proyecto}`);
          const turnoRes = await TurnoService.listarPorProyecto(proyectoActual.id_proyecto).catch(err => {
            console.error("❌ Error turnos:", err);
            return null;
          });

          const listaTurnos = Array.isArray(turnoRes) ? turnoRes : (turnoRes?.data ?? []);
          turnoActual = listaTurnos[0] ?? null;
          console.log("⏰ Turno Detectado Localmente:", turnoActual);
          setShift(turnoActual);
        } else {
          console.warn("⚠️ No se procede a buscar turnos: El empleado no registra proyectos activos.");
          setShift(null);
        }

        // =====================================================================
        // 4. ASISTENCIA
        // =====================================================================
        if (turnoActual?.id_turno) {
          console.log(`📍 Solicitando asistencia para el turno ID: ${turnoActual.id_turno}`);
          const asistenciaRes = await AsistenciaService.obtenerMiAsistenciaActual(turnoActual.id_turno).catch(err => {
            console.error("❌ Error de comunicación en asistencia:", err);
            return null;
          });
          console.log("📍 Respuesta Asistencia del Servidor:", asistenciaRes);

          if (asistenciaRes?.success && asistenciaRes?.data) {
            setToday({
              attendanceRegistered: true,
              checkIn: asistenciaRes.data.hora_ingreso ?? "Registrada"
            });
          } else {
            setToday({
              attendanceRegistered: false,
              checkIn: null
            });
          }
        } else {
          console.warn("❌ No se consulta asistencia: No se identificó ningún turno activo para hoy.");
          setToday({
            attendanceRegistered: false,
            checkIn: null
          });
        }
      } catch (error) {
        console.error("🔥 Error general en la carga secuencial del dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarDashboard();
  }, []);

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* CABECERA */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
            {employee?.initials ?? "--"}
          </div>
          <div>
            <h2 className="font-bold text-xl">Hola {employee?.name ?? "Empleado"} 👋</h2>
            <p className="text-sm opacity-70">Bienvenido a tu panel de trabajo</p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold">
              <i className="fas fa-clock"></i>
              {shift?.nombre ?? "Sin turno"} · {shift?.hora_ingreso ?? "--"} - {shift?.hora_salida ?? "--"}
            </div>
          </div>
        </div>
      </Card>

      {/* ESTADO DEL DÍA */}
      <Card title="Estado de Hoy" icon="fa-calendar-day">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-white/50 border">
            <div className="text-xs mb-1">Asistencia</div>
            <div className="font-bold">{today?.attendanceRegistered ? "✅ Registrada" : "❌ Pendiente"}</div>
          </div>
          <div className="rounded-2xl p-4 bg-white/50 border">
            <div className="text-xs mb-1">Entrada</div>
            <div className="font-bold">{today?.checkIn ?? "No registrada"}</div>
          </div>
        </div>
      </Card>

      {/* TAREAS */}
      <Card title="Tareas del Día" icon="fa-list-check">
        <div className="space-y-3">
          <div className="font-semibold">{tasks?.completed ?? 0} completadas / {tasks?.assigned ?? 0} asignadas</div>
          <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: `${tasks?.progress ?? 0}%` }} />
          </div>
          <div className="text-sm opacity-70">{tasks?.progress ?? 0}% completado</div>
        </div>
      </Card>

      {/* PROYECTO */}
      <Card title="Próximo Proyecto" icon="fa-building">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
            <i className="fas fa-building"></i>
          </div>
          <div>
            <div className="font-semibold">{nextProject?.nombre_proy ?? "Sin proyecto"}</div>
            <div className="text-sm opacity-70">{nextProject?.descripcion ?? "--"}</div>
          </div>
        </div>
      </Card>

      {/* ACCIONES */}
      <Card title="Acciones Rápidas" icon="fa-bolt">
        <div className="space-y-3">
          <button 
            onClick={() => {
              console.log("➡️ Redirigiendo a asistencia con Turno ID:", shift?.id_turno);
              navigate("/asistencia", { state: { idTurno: shift?.id_turno } });
            }}
            className="w-full rounded-xl py-3 font-semibold text-white cursor-pointer"
            style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
          >
            <i className="fas fa-fingerprint mr-2"></i>
            Registrar Asistencia
          </button>
          <button className="w-full rounded-xl py-3 font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
            <i className="fas fa-list-check mr-2"></i>
            Ver Tareas
          </button>
        </div>
      </Card>
    </div>
  );
}