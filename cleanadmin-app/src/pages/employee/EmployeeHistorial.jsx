import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../../components/Card";
import { AsistenciaService } from "../../api/asistencia.service";
import { useAuth } from "../../context/AuthContext";
import { formatearFecha } from "../../utils/formatters";
import SolicitarCorreccionAsistenciaModal from "../../components/modals/SolicitarCorreccionAsistenciaModal";

const ETIQUETAS_ESTADO_SOLICITUD = {
  PENDIENTE: { label: "Pendiente", className: "bg-amber-100 text-amber-700" },
  APROBADO: { label: "Aprobada", className: "bg-green-100 text-green-700" },
  RECHAZADO: { label: "Rechazada", className: "bg-red-100 text-red-700" },
};

export default function EmployeeHistorial() {

  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [registroParaCorregir, setRegistroParaCorregir] = useState(null);
  const [filtroFecha, setFiltroFecha] = useState("");

  const [monthlySummary, setMonthlySummary] = useState({
    workedDays: 0,
    delays: 0,
    absences: 0,
  });

  // NOTA: taskHistory seguía apuntando a un campo que el backend real nunca
  // devolvió desde este endpoint. Se deja en 0 -- no es parte de este
  // cambio; requeriría conectar con TareaService por separado.
  const [taskHistory] = useState({ completedTasks: 0, lastCompleted: [] });

  const cargarHistorial = useCallback(async () => {
    if (!user?.id_usuario) {
      console.warn("⚠️ Usuario no disponible aún");
      setLoading(false);
      return;
    }

    try {
      const [historialRes, solicitudesRes] = await Promise.all([
        AsistenciaService.obtenerMisAsistencias(),
        AsistenciaService.listarMisSolicitudes().catch((err) => {
          console.error("❌ Error cargando solicitudes de corrección:", err);
          return [];
        }),
      ]);

      // CAMBIO: el backend real (/asistencia/mi-historial) devuelve
      // directamente un arreglo plano de registros, no un objeto anidado
      // { monthlySummary, attendanceHistory, ... }. El resumen mensual
      // ahora se calcula acá mismo a partir de ese arreglo real.
      const registros = historialRes?.data ?? historialRes ?? [];

      setAttendanceHistory(registros);
      setMonthlySummary({
        workedDays: registros.filter((r) => ["PRESENTE", "ATRASO", "RETIRADO"].includes(r.estado)).length,
        delays: registros.filter((r) => r.estado === "ATRASO").length,
        absences: registros.filter((r) => r.estado === "FALTA_INJUSTIFICADA").length,
      });

      setSolicitudes(solicitudesRes?.data ?? solicitudesRes ?? []);

    } catch (error) {
      console.error("❌ Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("¿Deseas cerrar sesión?");
    if (!confirmLogout) return;

    await logoutUser();
    navigate("/login");
  };

  // ── Historial organizado: filtro por fecha exacta + agrupado por mes
  // (colapsable), para que no colapse la vista al tener muchos registros.
  const historialFiltrado = useMemo(
    () => attendanceHistory.filter(
      (r) => !filtroFecha || String(r.fecha).slice(0, 10) === filtroFecha
    ),
    [attendanceHistory, filtroFecha]
  );

  const gruposPorMes = useMemo(() => {
    const mapa = new Map();
    for (const r of historialFiltrado) {
      const fecha = new Date(r.fecha);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
      if (!mapa.has(clave)) {
        mapa.set(clave, {
          etiqueta: fecha.toLocaleDateString("es-CL", { month: "long", year: "numeric" }),
          registros: [],
        });
      }
      mapa.get(clave).registros.push(r);
    }
    // Más reciente primero
    return Array.from(mapa.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [historialFiltrado]);

  if (loading) {
    return <div className="p-4">Cargando historial...</div>;
  }

  return (
    <div className="p-4 space-y-4">

      {/* HEADER */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--card-title)" }}>
            Historial
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--card-subtitle)" }}>
            Revisa tu asistencia, tareas y registros anteriores
          </p>
        </div>
      </Card>

      {/* RESUMEN */}
      <Card title="Resumen Mensual" icon="fa-chart-column">
        <div className="grid grid-cols-3 gap-3">

          <div className="rounded-2xl p-4 text-center"
            style={{ background: "rgba(255,255,255,.75)", border: "1px solid var(--card-border)" }}>
            <i className="fas fa-calendar-check text-blue-500 text-xl mb-2" />
            <div className="text-2xl font-bold">{monthlySummary.workedDays}</div>
            <div className="text-xs text-gray-500">Días</div>
          </div>

          <div className="rounded-2xl p-4 text-center"
            style={{ background: "rgba(255,255,255,.75)", border: "1px solid var(--card-border)" }}>
            <i className="fas fa-clock text-amber-500 text-xl mb-2" />
            <div className="text-2xl font-bold">{monthlySummary.delays}</div>
            <div className="text-xs text-gray-500">Retrasos</div>
          </div>

          <div className="rounded-2xl p-4 text-center"
            style={{ background: "rgba(255,255,255,.75)", border: "1px solid var(--card-border)" }}>
            <i className="fas fa-user-check text-green-500 text-xl mb-2" />
            <div className="text-2xl font-bold">{monthlySummary.absences}</div>
            <div className="text-xs text-gray-500">Ausencias</div>
          </div>

        </div>
      </Card>

      {/* ASISTENCIA */}
      <Card title="Historial de Asistencia" icon="fa-calendar-days">
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 block mb-1">
            Buscar por fecha
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-xl text-sm bg-white outline-none focus:border-violet-400"
              style={{ borderColor: "var(--card-border)" }}
            />
            {filtroFecha && (
              <button
                onClick={() => setFiltroFecha("")}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {gruposPorMes.length === 0 && (
          <div className="text-sm text-gray-500">
            {filtroFecha
              ? "No hay asistencia registrada en esa fecha."
              : "No hay registros de asistencia."}
          </div>
        )}

        <div className="space-y-3">
          {gruposPorMes.map(([clave, grupo], i) => (
            <details
              key={clave}
              open={i === 0}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: "var(--card-border)" }}
            >
              <summary
                className="cursor-pointer select-none px-4 py-3 text-sm font-semibold flex items-center justify-between"
                style={{ background: "rgba(255,255,255,.5)" }}
              >
                <span className="capitalize">{grupo.etiqueta}</span>
                <span className="text-xs font-normal text-gray-400">
                  {grupo.registros.length} registro{grupo.registros.length !== 1 ? "s" : ""}
                </span>
              </summary>

              <div className="p-3 space-y-3">
                {grupo.registros.map((record) => (
                  <div key={record.id_asistencia}
                    className="rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,.75)", border: "1px solid var(--card-border)" }}>

                    <div className="font-semibold mb-3">{formatearFecha(record.fecha)}</div>

                    <div className="flex justify-between text-sm">
                      <span>Entrada</span>
                      <strong>{record.hora_ingreso ?? "--:--"}</strong>
                    </div>

                    <div className="flex justify-between text-sm mt-2">
                      <span>Salida</span>
                      <strong>{record.hora_egreso ?? "--:--"}</strong>
                    </div>

                    <button
                      onClick={() => setRegistroParaCorregir(record)}
                      className="w-full mt-3 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    >
                      <i className="fas fa-pen mr-1.5" />
                      Solicitar corrección
                    </button>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </Card>

      {/* TAREAS */}
      <Card title="Historial de Tareas" icon="fa-list-check">

        <div className="flex items-center gap-4">

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl"
            style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
            <i className="fas fa-list-check" />
          </div>

          <div>
            <div className="text-3xl font-bold">{taskHistory.completedTasks}</div>
            <p className="text-sm text-gray-500">Tareas completadas</p>
          </div>

        </div>

        <div className="mt-4 space-y-2">

          {taskHistory.lastCompleted.length === 0 && (
            <div className="text-sm text-gray-500">
              No hay tareas recientes.
            </div>
          )}

          {taskHistory.lastCompleted.map((task, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <i className="fas fa-check-circle text-green-500" />
              {task}
            </div>
          ))}

        </div>

      </Card>

      {/* SOLICITUDES DE CORRECCIÓN (antes "Apelaciones", ahora con datos reales) */}
      <Card title="Mis solicitudes de corrección" icon="fa-file-signature">

        <div className="space-y-3">

          {solicitudes.length === 0 && (
            <div className="text-sm text-gray-500">
              No has solicitado correcciones de asistencia.
            </div>
          )}

          {solicitudes.map((solicitud) => {
            const meta = ETIQUETAS_ESTADO_SOLICITUD[solicitud.estado_solicitud] || ETIQUETAS_ESTADO_SOLICITUD.PENDIENTE;
            return (
              <div key={solicitud.id_solicitud}
                className="flex items-center justify-between rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,.75)", border: "1px solid var(--card-border)" }}>

                <div className="min-w-0">
                  <span className="text-sm font-medium">{formatearFecha(solicitud.fecha_solicitud)}</span>
                  <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{solicitud.motivo}</div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${meta.className}`}>
                  {meta.label}
                </span>

              </div>
            );
          })}

        </div>

      </Card>

      {/* LOGOUT */}
      <Card>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20"
          style={{
            background: "linear-gradient(135deg,#dc2626,#ef4444)",
          }}
        >
          <i className="fas fa-right-from-bracket" />
          Cerrar Sesión
        </button>
      </Card>

      <SolicitarCorreccionAsistenciaModal
        isOpen={registroParaCorregir !== null}
        registro={registroParaCorregir}
        onClose={() => setRegistroParaCorregir(null)}
        onSuccess={cargarHistorial}
      />

    </div>
  );
}