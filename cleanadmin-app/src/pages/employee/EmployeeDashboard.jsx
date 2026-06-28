import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../../components/Card";
import { AuthService } from "../../api/auth.service";
import { ProyectoService } from "../../api/proyecto.service";
import { TurnoService } from "../../api/turno.service";
import { TareaService } from "../../api/tareas.service";
import { AsistenciaService } from "../../api/asistencia.service";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const [shift, setShift] = useState(null);
  const [attendanceRecord, setAttendanceRecord] = useState(null); // Contiene el objeto completo AsistenciaEmpleado
  const [tasks, setTasks] = useState({ assigned: 0, completed: 0, progress: 0 });
  const [nextProject, setNextProject] = useState(null);

  useEffect(() => {
    async function cargarDashboard() {
      try {
        console.log("🚀 Iniciando carga predictiva del Dashboard...");

        // =====================================================================
        // 1. USUARIO
        // =====================================================================
        const me = await AuthService.me();
        const user = me?.user;
        if (!user) {
          console.warn("⚠️ No hay usuario autenticado.");
          return;
        }

        const nombre = user.nombre ?? "Empleado";
        setEmployee({
          id: user.id_usuario,
          name: nombre,
          initials: nombre.split(" ").filter(Boolean).map(w => w[0]).join("").substring(0, 2).toUpperCase(),
          role: user.rol,
          email: user.correo
        });

        // =====================================================================
        // 2. PROYECTO + TAREAS EN PARALELO
        // =====================================================================
        const [proyectosRes, tareasRes] = await Promise.all([
          ProyectoService.listar().catch(err => {
            console.error("❌ Error proyectos:", err);
            return [];
          }),
          TareaService.misTareas().catch(err => {
            console.error("❌ Error tareas asignadas:", err);
            return { data: [] };
          })
        ]);

        const proyectos = Array.isArray(proyectosRes) ? proyectosRes : (proyectosRes?.data ?? []);
        const asignaciones = tareasRes?.data ?? [];

        const proyectoActual = proyectos[0] ?? null;
        setNextProject(proyectoActual);

        // Mapeo inicial de métricas de tareas
        const total = asignaciones.length;
        const completadas = asignaciones.filter(a => a.tarea?.estado === "FINALIZADA").length;
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
          const turnoRes = await TurnoService.listarPorProyecto(proyectoActual.id_proyecto).catch(err => {
            console.error("❌ Error turnos:", err);
            return null;
          });

          const listaTurnos = Array.isArray(turnoRes) ? turnoRes : (turnoRes?.data ?? []);
          turnoActual = listaTurnos[0] ?? null;
          setShift(turnoActual);
        } else {
          setShift(null);
        }

        // =====================================================================
        // 4. CONSULTA CRÍTICA DE ASISTENCIA: Evaluación de Estado Real
        // =====================================================================
        if (turnoActual?.id_turno) {
          const asistenciaRes = await AsistenciaService.obtenerMiAsistenciaActual(turnoActual.id_turno).catch(err => {
            console.error("❌ Error de comunicación en asistencia:", err);
            return null;
          });

          if (asistenciaRes?.success && asistenciaRes?.data) {
            setAttendanceRecord(asistenciaRes.data);
          } else {
            setAttendanceRecord(null); // Registro no inicializado o fuera de snapshot
          }
        } else {
          setAttendanceRecord(null);
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
    return <div className="p-4 text-center font-medium">Sincronizando jornada laboral...</div>;
  }

  // Desestructuración de variables de control y enums de negocio
  const estadoAsistencia = attendanceRecord?.estado ?? "SINFOTO"; 
  const horaIngresoMarcada = attendanceRecord?.hora_ingreso ?? null;

  // Bandera UX para habilitar/deshabilitar la interacción operacional de tareas
  const puedeTrabajarTareas = ["PRESENTE", "ATRASO"].includes(estadoAsistencia);

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
            <p className="text-sm opacity-70">Panel de control de operaciones</p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
              <i className="fas fa-clock"></i>
              {shift?.nombre ?? "Sin turno asignado"} · {shift?.hora_ingreso?.substring(0,5) ?? "--:--"} - {shift?.hora_salida?.substring(0,5) ?? "--:--"}
            </div>
          </div>
        </div>
      </Card>

      {/* BANNER DE ADVERTENCIA PARA FALTA INJUSTIFICADA */}
      {estadoAsistencia === "FALTA_INJUSTIFICADA" && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3 text-sm animate-fade-in">
          <i className="fas fa-triangle-exclamation text-lg mt-0.5" />
          <div>
            <span className="font-bold">Inasistencia Registrada:</span> Se ha cumplido el tiempo límite de tolerancia para el ingreso de tu turno. Comunícate con administración para regularizar tu estado.
          </div>
        </div>
      )}

      {/* BANNER DE INFORMATIVO PARA FALTA JUSTIFICADA */}
      {estadoAsistencia === "FALTA_JUSTIFICADA" && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-start gap-3 text-sm animate-fade-in">
          <i className="fas fa-circle-info text-lg mt-0.5" />
          <div>
            <span className="font-bold">Ausencia Justificada:</span> Registras una justificación válida autorizada por RRHH para esta jornada.
          </div>
        </div>
      )}

      {/* ESTADO DEL DÍA MAPPED DESDE BASE DE DATOS */}
      <Card title="Estado de Asistencia Hoy" icon="fa-calendar-day">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-white/50 border">
            <div className="text-xs mb-1 text-gray-500">Estado Actual</div>
            <div className="font-bold text-sm">
              {estadoAsistencia === "EN_ESPERA" && "⏳ En Espera"}
              {estadoAsistencia === "PRESENTE" && "✅ Presente"}
              {estadoAsistencia === "ATRASO" && "⚠️ Atraso"}
              {estadoAsistencia === "RETIRADO" && "🚪 Retirado"}
              {estadoAsistencia === "FALTA_INJUSTIFICADA" && "❌ Inasistente"}
              {estadoAsistencia === "FALTA_JUSTIFICADA" && "ℹ️ Justificado"}
              {estadoAsistencia === "SINFOTO" && "🚫 Sin Turno Activo"}
            </div>
          </div>
          <div className="rounded-2xl p-4 bg-white/50 border">
            <div className="text-xs mb-1 text-gray-500">Registro de Entrada</div>
            <div className="font-bold text-sm text-gray-700">
              {horaIngresoMarcada ? `${horaIngresoMarcada.substring(0, 5)} hrs` : "No registrada"}
            </div>
          </div>
        </div>
      </Card>

      {/* PANEL DE TAREAS CONDICIONAL */}
      <Card title="Progreso de Actividades" icon="fa-list-check">
        {puedeTrabajarTareas ? (
          <div className="space-y-3">
            <div className="font-semibold text-sm">{tasks.completed} completadas / {tasks.assigned} asignadas</div>
            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500" style={{ width: `${tasks.progress}%` }} />
            </div>
            <div className="text-xs opacity-70 font-medium">{tasks.progress}% completado de la jornada</div>
          </div>
        ) : (
          <div className="text-center text-sm py-4 text-gray-400 italic">
            <i className="fas fa-lock mr-2"></i> 
            Debes registrar tu ingreso laboral para interactuar con tus actividades asignadas.
          </div>
        )}
      </Card>

      {/* PROYECTO ASIGNADO */}
      <Card title="Proyecto Asignado" icon="fa-building">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
            <i className="fas fa-building text-lg"></i>
          </div>
          <div>
            <div className="font-semibold text-base">{nextProject?.nombre_proy ?? "Sin proyecto activo"}</div>
            <div className="text-sm opacity-70 mt-0.5">{nextProject?.descripcion ?? "No registras asignaciones globales de trabajo hoy."}</div>
          </div>
        </div>
      </Card>

      {/* ACCIONES COMPORTAMENTALES RÁPIDAS */}
      <Card title="Acciones Disponibles" icon="fa-bolt">
        <div className="space-y-3">
          
          {/* BOTÓN REGISTRAR ENTRADA (Visible solo en espera de marcaje) */}
          {estadoAsistencia === "EN_ESPERA" && (
            <button 
              onClick={() => navigate("/asistencia", { state: { idTurno: shift?.id_turno, modo: "INGRESO" } })}
              className="w-full rounded-xl py-3 font-semibold text-white cursor-pointer bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-95 transition-opacity text-sm"
            >
              <i className="fas fa-fingerprint mr-2"></i>
              Registrar Entrada
            </button>
          )}

          {/* BOTÓN REGISTRAR SALIDA (Visible si el operario se encuentra laborando activamente) */}
          {["PRESENTE", "ATRASO"].includes(estadoAsistencia) && (
            <button 
              onClick={() => navigate("/asistencia", { state: { idTurno: shift?.id_turno, modo: "EGRESO" } })}
              className="w-full rounded-xl py-3 font-semibold text-white cursor-pointer bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 transition-opacity text-sm"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Registrar Salida de Jornada
            </button>
          )}

          {/* BOTÓN DESHABILITADO POR CIERRE O BLOQUEO DE SEGURIDAD */}
          {["RETIRADO", "FALTA_INJUSTIFICADA", "FALTA_JUSTIFICADA"].includes(estadoAsistencia) && (
            <button 
              disabled
              className="w-full rounded-xl py-3 font-semibold bg-gray-100 text-gray-400 cursor-not-allowed text-sm border border-dashed border-gray-300"
            >
              <i className="fas fa-circle-check mr-2"></i>
              Operación de Asistencia Bloqueada / Finalizada
            </button>
          )}

          {/* BOTÓN DE ENTRADA AL MÓDULO DE TAREAS CONDICIONADO */}
          <button 
            disabled={!puedeTrabajarTareas}
            onClick={() => navigate("/tareas")}
            className={`w-full rounded-xl py-3 font-semibold text-sm transition-all ${
              puedeTrabajarTareas 
                ? "text-white cursor-pointer hover:opacity-95" 
                : "bg-gray-50 text-gray-300 cursor-not-allowed border"
            }`}
            style={{ 
              background: puedeTrabajarTareas ? "linear-gradient(135deg,#7c3aed,#3b82f6)" : "transparent" 
            }}
          >
            <i className="fas fa-list-check mr-2"></i>
            Ver Mis Tareas { !puedeTrabajarTareas && " (Bloqueado)" }
          </button>
          
        </div>
      </Card>
    </div>
  );
}