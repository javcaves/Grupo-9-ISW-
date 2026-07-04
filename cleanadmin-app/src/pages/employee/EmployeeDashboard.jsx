import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../../components/Card";
import { AuthService } from "../../api/auth.service";
import { TareaService } from "../../api/tareas.service";
import { AsistenciaService } from "../../api/asistencia.service";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const [employee, setEmployee]           = useState(null);
  const [loading, setLoading]             = useState(true);
  const [shift, setShift]                 = useState(null);
  const [apiCode, setApiCode]             = useState("");
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [tasks, setTasks]                 = useState({ assigned: 0, completed: 0, progress: 0 });
  const [nextProject, setNextProject]     = useState(null);

  useEffect(() => {
    async function cargarDashboard() {
      try {
        // 1. USUARIO
        const me   = await AuthService.me();
        const user = me?.user;
        if (!user) return;

        const nombre = user.nombre ?? "Empleado";
        setEmployee({
          id:       user.id_usuario,
          name:     nombre,
          initials: nombre.split(" ").filter(Boolean).map(w => w[0]).join("").substring(0, 2).toUpperCase(),
          role:     user.rol,
          email:    user.correo,
        });

        // 2. TAREAS + TURNO REAL EN PARALELO
        const [tareasRes, miTurnoRes] = await Promise.all([
          TareaService.misTareas().catch(() => ({ data: [] })),
          AsistenciaService.obtenerMiTurno().catch(() => null),
        ]);

        // Tareas
        const asignaciones = tareasRes?.data ?? [];
        const total        = asignaciones.length;
        const completadas  = asignaciones.filter(a => a.tarea?.estado === "FINALIZADA").length;
        setTasks({
          assigned:  total,
          completed: completadas,
          progress:  total === 0 ? 0 : Math.round((completadas / total) * 100),
        });

        // Turno real del empleado (no el primero del proyecto)
        const turnoReal = miTurnoRes?.data ?? miTurnoRes ?? null;
        setShift(turnoReal);

        // Proyecto desde el turno (si el turno tiene relación con proyecto)
        if (turnoReal?.proyecto) {
          setNextProject(turnoReal.proyecto);
        }

        // 3. ASISTENCIA DEL DÍA
        if (turnoReal?.id_turno) {
          const asistenciaRes = await AsistenciaService.obtenerMiAsistenciaActual(turnoReal.id_turno).catch(() => null);

          // asistenciaRes = { code, data }
          const codigoApi  = asistenciaRes?.code  ?? null;
          const registroDb = asistenciaRes?.data   ?? null;

          if (codigoApi) setApiCode(codigoApi);

          if (registroDb) {
            setAttendanceRecord(registroDb);
          } else {
            setAttendanceRecord(null);
          }
        }

      } catch (error) {
        console.error("🔥 Error en dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        <p className="text-sm font-medium opacity-60">Sincronizando jornada laboral...</p>
      </div>
    );
  }

  const estadoAsistencia   = attendanceRecord?.estado ?? "SIN_TURNO";
  const horaIngresoMarcada = attendanceRecord?.hora_ingreso ?? null;
  const puedeTrabajarTareas = ["PRESENTE", "ATRASO"].includes(estadoAsistencia);
  const esFinDeSemana       = apiCode === "FIN_DE_SEMANA";
  const sinTurnoAsignado    = apiCode === "SIN_TURNO_ASIGNADO" || !shift;

  // Configuración de color/icono por estado
  const estadoConfig = {
    EN_ESPERA:          { label: "En Espera",       icon: "fa-clock",             bg: "bg-violet-50",  border: "border-violet-200", text: "text-violet-700",  dot: "bg-violet-400"  },
    ESPERANDO_INGRESO:  { label: "En Espera",       icon: "fa-clock",             bg: "bg-violet-50",  border: "border-violet-200", text: "text-violet-700",  dot: "bg-violet-400"  },
    PRESENTE:           { label: "Presente",         icon: "fa-circle-check",      bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700",   dot: "bg-green-500"   },
    ATRASO:             { label: "Con Atraso",       icon: "fa-triangle-exclamation", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700",   dot: "bg-amber-400"   },
    RETIRADO:           { label: "Retirado",         icon: "fa-door-open",         bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700",    dot: "bg-blue-400"    },
    FALTA_INJUSTIFICADA:{ label: "Inasistente",      icon: "fa-xmark-circle",      bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700",     dot: "bg-red-500"     },
    FALTA_JUSTIFICADA:  { label: "Justificado",      icon: "fa-circle-info",       bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",   dot: "bg-amber-400"   },
    FIN_DE_SEMANA:      { label: "Fin de Semana",    icon: "fa-umbrella-beach",    bg: "bg-sky-50",     border: "border-sky-200",    text: "text-sky-700",     dot: "bg-sky-400"     },
    SIN_TURNO:          { label: "Sin Turno Activo", icon: "fa-ban",               bg: "bg-gray-50",    border: "border-gray-200",   text: "text-gray-500",    dot: "bg-gray-300"    },
  };

  const estadoKey    = esFinDeSemana ? "FIN_DE_SEMANA" : (estadoAsistencia in estadoConfig ? estadoAsistencia : "SIN_TURNO");
  const estadoInfo   = estadoConfig[estadoKey];

  return (
    <div className="p-4 space-y-4 pb-24">

      {/* ── CABECERA ── */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
          >
            {employee?.initials ?? "--"}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-xl truncate">Hola, {employee?.name ?? "Empleado"} 👋</h2>
            <p className="text-sm opacity-60">Panel de operaciones</p>
            {shift ? (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
                <i className="fas fa-business-time"></i>
                {shift.nombre} · {shift.hora_ingreso?.substring(0, 5) ?? "--:--"} – {shift.hora_salida?.substring(0, 5) ?? "--:--"}
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                <i className="fas fa-ban"></i> Sin turno asignado
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ── ESTADO DEL DÍA ── */}
      <Card title="Estado de Asistencia" icon="fa-calendar-day">
        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${estadoInfo.bg} ${estadoInfo.border}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${estadoInfo.bg}`}>
            <i className={`fas ${estadoInfo.icon} text-xl ${estadoInfo.text}`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-bold text-base ${estadoInfo.text}`}>
              {esFinDeSemana ? "¡Disfruta tu descanso!" : estadoInfo.label}
            </div>
            <div className="text-xs opacity-70 mt-0.5">
              {esFinDeSemana
                ? "No registras jornadas operativas hoy."
                : sinTurnoAsignado
                ? "No tienes un turno vinculado activamente."
                : horaIngresoMarcada
                ? `Entrada registrada a las ${horaIngresoMarcada.substring(0, 5)} hrs`
                : estadoAsistencia === "EN_ESPERA" || apiCode === "ESPERANDO_INGRESO"
                ? `Tu turno comienza a las ${shift?.hora_ingreso?.substring(0, 5) ?? "--:--"} hrs`
                : "Sin marcas de asistencia registradas hoy."}
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full shrink-0 ${estadoInfo.dot}`} />
        </div>

        {/* Fila de horas si hay registro */}
        {attendanceRecord && !esFinDeSemana && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="p-3 rounded-xl border bg-white/50 text-center">
              <div className="text-xs opacity-50 mb-1">Hora Entrada</div>
              <div className="font-bold text-sm">{attendanceRecord.hora_ingreso?.substring(0, 5) ?? "--:--"}</div>
            </div>
            <div className="p-3 rounded-xl border bg-white/50 text-center">
              <div className="text-xs opacity-50 mb-1">Hora Salida</div>
              <div className={`font-bold text-sm ${!attendanceRecord.hora_egreso ? "text-amber-500" : ""}`}>
                {attendanceRecord.hora_egreso?.substring(0, 5) ?? "Pendiente"}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ── ALERTAS CRÍTICAS ── */}
      {estadoAsistencia === "FALTA_INJUSTIFICADA" && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3 text-sm">
          <i className="fas fa-triangle-exclamation text-lg mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">Inasistencia registrada.</span> Se cumplió el tiempo límite de tolerancia. Comunícate con administración para regularizar tu estado.
          </div>
        </div>
      )}
      {estadoAsistencia === "FALTA_JUSTIFICADA" && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-start gap-3 text-sm">
          <i className="fas fa-circle-info text-lg mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">Ausencia justificada.</span> Registras una justificación autorizada por RRHH para esta jornada.
          </div>
        </div>
      )}

      {/* ── ACCIONES RÁPIDAS ── */}
      {!esFinDeSemana && !sinTurnoAsignado && (
        <Card title="Acciones Disponibles" icon="fa-bolt">
          <div className="space-y-3">

            {(estadoAsistencia === "EN_ESPERA" || apiCode === "ESPERANDO_INGRESO") && (
              <button
                onClick={() => navigate("/asistencia", { state: { idTurno: shift?.id_turno } })}
                className="w-full rounded-xl py-3.5 font-semibold text-white text-sm cursor-pointer hover:opacity-95 transition-opacity"
                style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
              >
                <i className="fas fa-fingerprint mr-2"></i>
                Registrar Entrada al Turno
              </button>
            )}

            {["PRESENTE", "ATRASO"].includes(estadoAsistencia) && (
              <button
                onClick={() => navigate("/asistencia", { state: { idTurno: shift?.id_turno } })}
                className="w-full rounded-xl py-3.5 font-semibold text-white text-sm cursor-pointer hover:opacity-95 transition-opacity"
                style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Registrar Salida de Jornada
              </button>
            )}

            {["RETIRADO", "FALTA_INJUSTIFICADA", "FALTA_JUSTIFICADA"].includes(estadoAsistencia) && (
              <button disabled className="w-full rounded-xl py-3.5 font-semibold bg-gray-100 text-gray-400 cursor-not-allowed text-sm border border-dashed">
                <i className="fas fa-circle-check mr-2"></i>
                Asistencia Finalizada / Bloqueada
              </button>
            )}

            <button
              disabled={!puedeTrabajarTareas}
              onClick={() => navigate("/tareas")}
              className={`w-full rounded-xl py-3.5 font-semibold text-sm transition-all ${
                puedeTrabajarTareas
                  ? "text-white cursor-pointer hover:opacity-95"
                  : "bg-gray-50 text-gray-300 cursor-not-allowed border border-dashed"
              }`}
              style={puedeTrabajarTareas ? { background: "linear-gradient(135deg,#7c3aed,#3b82f6)" } : {}}
            >
              <i className="fas fa-list-check mr-2"></i>
              Ver Mis Tareas{!puedeTrabajarTareas && " (requiere ingreso)"}
            </button>

          </div>
        </Card>
      )}

      {/* ── PROGRESO DE TAREAS ── */}
      <Card title="Progreso de Actividades" icon="fa-list-check">
        {puedeTrabajarTareas ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span>{tasks.completed} completadas</span>
              <span className="opacity-50">{tasks.assigned} asignadas</span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${tasks.progress}%`, background: "linear-gradient(90deg,#7c3aed,#3b82f6)" }}
              />
            </div>
            <div className="text-xs opacity-60 text-right font-medium">{tasks.progress}% completado</div>
          </div>
        ) : (
          <div className="text-center text-sm py-5 text-gray-400 italic">
            <i className="fas fa-lock mr-2"></i>
            Registra tu ingreso para acceder a tus actividades.
          </div>
        )}
      </Card>

      {/* ── PROYECTO ── */}
      {nextProject && (
        <Card title="Proyecto Asignado" icon="fa-building">
          <div className="flex gap-4 items-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
            >
              <i className="fas fa-building"></i>
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-base truncate">{nextProject.nombre_proy ?? nextProject.nombre ?? "Proyecto"}</div>
              <div className="text-xs opacity-60 mt-0.5 truncate">{nextProject.ubicacion ?? nextProject.descripcion ?? "Sin descripción"}</div>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}