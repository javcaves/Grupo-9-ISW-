import { useEffect, useState } from "react";

import { Card } from "../../components/Card";
import { AuthService } from "../../api/auth.service";
import { ProyectoService } from "../../api/proyecto.service";
import { TurnoService } from "../../api/turno.service";
import { TareaService } from "../../api/tareas.service";
import { AsistenciaService } from "../../api/asistencia.service";

export default function EmployeeDashboard() {

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

        // 1. Usuario
        const me = await AuthService.me();
        console.log("👤 Usuario:", me);

        const user = me?.user;

        if (!user) {
          console.warn("No hay usuario");
          return;
        }

        const nombre = user.nombre ?? "Empleado";

        const empleado = {
          id: user.id_usuario,
          name: nombre,
          initials: nombre
            .split(" ")
            .filter(Boolean)
            .map(w => w[0])
            .join("")
            .substring(0, 2)
            .toUpperCase(),
          role: user.rol,
          email: user.correo
        };

        setEmployee(empleado);

        // 2. Proyecto + tareas en paralelo
        const [proyectosRes, tareasRes] = await Promise.all([
          ProyectoService.listar().catch(err => {
            console.error("❌ Error proyectos:", err);
            return null;
          }),
          TareaService.listar().catch(err => {
            console.error("❌ Error tareas:", err);
            return null;
          })
        ]);

        console.log("📁 Proyectos:", proyectosRes);
        console.log("📌 Tareas:", tareasRes);

        const proyectos = proyectosRes?.data ?? [];
        const tareas = tareasRes?.data ?? [];

        const proyecto = proyectos[0] ?? null;

        setNextProject(proyecto);

        // tareas del usuario (fallback simple)
        const tareasUsuario = tareas.filter(t => t.id_usuario === user.id_usuario);

        const total = tareasUsuario.length;
        const completadas = tareasUsuario.filter(t => t.estado === "COMPLETADA").length;

        setTasks({
          assigned: total,
          completed: completadas,
          progress: total === 0 ? 0 : Math.round((completadas / total) * 100)
        });

        // 3. Turno
        if (proyecto?.id) {

          const turnoRes = await TurnoService.listarPorProyecto(proyecto.id)
            .catch(err => {
              console.error("❌ Error turnos:", err);
              return null;
            });

          console.log("⏰ Turnos:", turnoRes);

          const turno = turnoRes?.data?.[0];

          setShift(turno ?? null);
        }

        // 4. Asistencia (mock lógico por ahora)
        if (shift?.id_turno) {

          const asistencia = await AsistenciaService.obtenerActual(shift.id_turno)
            .catch(err => {
              console.error("❌ Error asistencia:", err);
              return null;
            });

          console.log("📍 Asistencia:", asistencia);

          setToday({
            attendanceRegistered: !!asistencia?.data,
            checkIn: asistencia?.data?.check_in ?? null
          });

        } else {

          setToday({
            attendanceRegistered: false,
            checkIn: null
          });

        }

      } catch (error) {

        console.error("🔥 Error general dashboard:", error);

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

            <h2 className="font-bold text-xl">
              Hola {employee?.name ?? "Empleado"} 👋
            </h2>

            <p className="text-sm opacity-70">
              Bienvenido a tu panel de trabajo
            </p>

            <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold">

              <i className="fas fa-clock"></i>

              {shift?.tipo ?? "Sin turno"} · {shift?.hora_inicio ?? "--"} - {shift?.hora_fin ?? "--"}

            </div>

          </div>

        </div>

      </Card>

      {/* ESTADO DEL DÍA */}
      <Card title="Estado de Hoy" icon="fa-calendar-day">

        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-2xl p-4 bg-white/50 border">
            <div className="text-xs mb-1">Asistencia</div>
            <div className="font-bold">
              {today?.attendanceRegistered ? "✅ Registrada" : "❌ Pendiente"}
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-white/50 border">
            <div className="text-xs mb-1">Entrada</div>
            <div className="font-bold">
              {today?.checkIn ?? "--"}
            </div>
          </div>

        </div>

      </Card>

      {/* TAREAS */}
      <Card title="Tareas del Día" icon="fa-list-check">

        <div className="space-y-3">

          <div className="font-semibold">
            {tasks?.completed ?? 0} completadas / {tasks?.assigned ?? 0} asignadas
          </div>

          <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-blue-500"
              style={{ width: `${tasks?.progress ?? 0}%` }}
            />
          </div>

          <div className="text-sm opacity-70">
            {tasks?.progress ?? 0}% completado
          </div>

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

            <div className="font-semibold">
              {nextProject?.nombre ?? "Sin proyecto"}
            </div>

            <div className="text-sm opacity-70">
              {nextProject?.descripcion ?? "--"}
            </div>

          </div>

        </div>

      </Card>

      {/* ACCIONES */}
      <Card title="Acciones Rápidas" icon="fa-bolt">

        <div className="space-y-3">

          <button className="w-full rounded-xl py-3 font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
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