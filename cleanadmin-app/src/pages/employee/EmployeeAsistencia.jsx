import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "../../components/Card";
import { AuthService } from "../../api/auth.service";
import { AsistenciaService } from "../../api/asistencia.service";
import { ProyectoService } from "../../api/proyecto.service";
import { TurnoService } from "../../api/turno.service";

export default function EmployeeAsistencia() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeShiftId, setActiveShiftId] = useState(location.state?.idTurno ?? null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentShift, setCurrentShift] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [lunch, setLunch] = useState(null);
  const [corrections, setCorrections] = useState([]);

  useEffect(() => {
    async function cargarDatos() {
      try {
        console.log("🔍 [Asistencia - INSPECCIÓN] Iniciando carga inteligente...");
        let turnoIdFinal = activeShiftId;
        let objetoTurnoAux = null;

        // 1. Perfil del usuario
        const resMe = await AuthService.me();
        if (resMe?.success && resMe?.user) {
          setUser(resMe.user);
        }

        // Recuperación autónoma por si se pierde el State (F5)
        if (!turnoIdFinal) {
          const proyectosRes = await ProyectoService.listar().catch(() => []);
          const proyectos = Array.isArray(proyectosRes) ? proyectosRes : (proyectosRes?.data ?? []);
          const proyectoActual = proyectos[0] ?? null;

          if (proyectoActual?.id_proyecto) {
            const turnoRes = await TurnoService.listarPorProyecto(proyectoActual.id_proyecto).catch(() => null);
            const listaTurnos = Array.isArray(turnoRes) ? turnoRes : (turnoRes?.data ?? []);
            objetoTurnoAux = listaTurnos[0] ?? null;

            if (objetoTurnoAux?.id_turno) {
              turnoIdFinal = objetoTurnoAux.id_turno;
              setActiveShiftId(turnoIdFinal);
            }
          }
        }

        // 2. Consulta crítica a la API y Console Log de la Estructura Real
        if (turnoIdFinal) {
          const asistenciaRes = await AsistenciaService.obtenerMiAsistenciaActual(turnoIdFinal).catch(err => {
            console.error("❌ [Asistencia - INSPECCIÓN] Falló la petición HTTP:", err);
            return null;
          });

          // ===================================================================
          // 🔥 EL CONSOLE LOG RADAR: Copia lo que imprima esto en tu navegador
          // ===================================================================
          console.group("📡 [FRONTEND RADAR] ESTRUCTURA COMPLETA DEL ENDPOINT");
          console.log("1. ¿La respuesta fue exitosa? ->", asistenciaRes?.success);
          console.log("2. Payload completo (asistenciaRes):", asistenciaRes);
          console.log("3. Datos internos (asistenciaRes?.data):", asistenciaRes?.data);
          if (asistenciaRes?.data) {
            console.log("4. ¿Tiene objeto turno anidado?:", asistenciaRes.data.asistencia?.turno || "No hay objeto turno anidado");
            console.log("5. Llaves disponibles en la raíz de data:", Object.keys(asistenciaRes.data));
          }
          console.groupEnd();
          // ===================================================================

          if (asistenciaRes?.success && asistenciaRes?.data) {
            const registroDb = asistenciaRes.data;
            
            setCurrentRecord({
              checkIn: registroDb.hora_ingreso ?? "--",
              checkOut: registroDb.hora_egreso ?? "Pendiente",
              estado: registroDb.estado ?? "EN_ESPERA"
            });

            // Intento dinámico leyendo lo que venga de la DB
            const tInfo = registroDb.asistencia?.turno || objetoTurnoAux;
            setCurrentShift({
              nombre: tInfo?.nombre ?? "Turno Operativo",
              start: tInfo?.hora_ingreso?.substring(0, 5) ?? "--:--",
              end: tInfo?.hora_salida?.substring(0, 5) ?? "--:--",
            });

            // Evaluamos si el backend ya manda campos de colación
            setLunch({
              startTime: tInfo?.hora_inicio_colacion?.substring(0, 5) || tInfo?.inicio_colacion?.substring(0, 5) || "13:00",
              endTime: tInfo?.hora_fin_colacion?.substring(0, 5) || tInfo?.fin_colacion?.substring(0, 5) || "14:00"
            });

          } else {
            // Estructura limpia de fallback si no hay marcas creadas todavía
            setCurrentRecord({ checkIn: "--", checkOut: "Pendiente", estado: "EN_ESPERA" });
            setCurrentShift({
              nombre: objetoTurnoAux?.nombre ?? "Turno General",
              start: objetoTurnoAux?.hora_ingreso?.substring(0, 5) ?? "--:--",
              end: objetoTurnoAux?.hora_salida?.substring(0, 5) ?? "--:--",
            });
            setLunch({ startTime: "13:00", endTime: "14:00" });
          }
        } else {
          setCurrentRecord(null);
          setCurrentShift(null);
        }

        setCorrections([]);

      } catch (err) {
        console.error("[Asistencia] Error crítico:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, [activeShiftId]);

  // =====================================================================
  // ACCIONES DE MARCAJE
  // =====================================================================
  const ejecutarMarcaje = async (tipoMarca) => {
    try {
      if (!activeShiftId) return alert("Error: No hay un turno asociado para efectuar la marca.");
      
      const res = await AsistenciaService.marcar({
        tipo: tipoMarca,
        id_turno: Number(activeShiftId)
      });

      if (res?.success) {
        alert(`✅ ${tipoMarca === "ENTRADA" ? "Ingreso" : "Salida"} registrada correctamente.`);
        window.location.reload();
      } else {
        alert(`❌ Error en marcaje: ${res?.message || "Operación denegada por reglas de geofencing o tiempo."}`);
      }
    } catch (err) {
      console.error(`[Asistencia] Error registrando ${tipoMarca}:`, err);
    }
  };

  if (loading) {
    return <div className="p-4 text-center font-medium">Sincronizando registros biométricos...</div>;
  }

  const estadoActual = currentRecord?.estado ?? "SINFOTO";
  const tieneIngreso = currentRecord?.checkIn && currentRecord.checkIn !== "--";
  const tieneSalida = currentRecord?.checkOut && currentRecord.checkOut !== "Pendiente";

  const esEstadoBloqueado = ["RETIRADO", "FALTA_INJUSTIFICADA", "FALTA_JUSTIFICADA", "SINFOTO"].includes(estadoActual);

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* BOTÓN VOLVER */}
      <button
        onClick={() => navigate("/dashboard")}
        className="text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-2 cursor-pointer"
      >
        <i className="fas fa-arrow-left"></i> Volver al Dashboard
      </button>

      {/* HEADER */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10">
        <h1 className="text-2xl font-bold" style={{ color: "var(--card-title)" }}>
          Asistencia {user?.nombre ? `· ${user.nombre}` : ""}
        </h1>
        <p className="mt-2 text-sm opacity-75">
          Terminal de auto-control por Token y Geolocalización
        </p>
      </Card>

      {/* ALERTA EN CASO DE NO ESTAR EN SU TURNO */}
      {esEstadoBloqueado && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${
          estadoActual === "FALTA_INJUSTIFICADA" ? "bg-red-50 border-red-200 text-red-800" :
          estadoActual === "FALTA_JUSTIFICADA" ? "bg-amber-50 border-amber-200 text-amber-800" :
          estadoActual === "RETIRADO" ? "bg-blue-50 border-blue-200 text-blue-800" :
          "bg-gray-50 border-gray-200 text-gray-500"
        }`}>
          <i className="fas fa-circle-info mr-2"></i>
          {estadoActual === "FALTA_INJUSTIFICADA" && "Jornada Cerrada por Inasistencia Automática (Tolerancia Excedida)."}
          {estadoActual === "FALTA_JUSTIFICADA" && "Día Libre / Ausencia Justificada autorizada por la empresa."}
          {estadoActual === "RETIRADO" && "Has completado tu turno de hoy. Tu registro está cerrado con éxito."}
          {estadoActual === "SINFOTO" && "No registras ningún turno activo programado para el día de hoy."}
        </div>
      )}

      {/* TURNO ASIGNADO */}
      {activeShiftId && (
        <Card title="Horario de Turno Asignado" icon="fa-business-time">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
              <i className="fas fa-business-time text-xl"></i>
            </div>
            <div>
              <div className="font-bold text-lg">
                {currentShift?.start ?? "--:--"} - {currentShift?.end ?? "--:--"}
              </div>
              <div className="text-xs opacity-70 mb-1">{currentShift?.nombre ?? "Ventana Laboral"}</div>
              <div className={`mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                estadoActual === "PRESENTE" ? "bg-green-100 text-green-700" :
                estadoActual === "ATRASO" ? "bg-amber-100 text-amber-700" :
                estadoActual === "EN_ESPERA" ? "bg-violet-100 text-violet-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                <i className="fas fa-circle text-[8px]"></i>
                {estadoActual}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* REGISTRO DE ASISTENCIA */}
      {activeShiftId && (
        <Card title="Escanear Código QR de Punto de Control" icon="fa-qrcode">
          <div className="space-y-3">
            <button
              onClick={() => ejecutarMarcaje("ENTRADA")}
              disabled={tieneIngreso || esEstadoBloqueado}
              className={`w-full rounded-xl py-4 text-white font-semibold transition-all shadow-sm text-sm ${
                tieneIngreso || esEstadoBloqueado
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-dashed"
                  : "cursor-pointer hover:opacity-95"
              }`}
              style={!(tieneIngreso || esEstadoBloqueado) ? { background: "linear-gradient(135deg,#7c3aed,#3b82f6)" } : {}}
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              {tieneIngreso ? "Entrada Registrada" : esEstadoBloqueado ? "Entrada Inhabilitada" : "Escanear QR Entrada"}
            </button>

            <button
              onClick={() => ejecutarMarcaje("SALIDA")}
              disabled={!tieneIngreso || tieneSalida || esEstadoBloqueado}
              className={`w-full rounded-xl py-4 text-white font-semibold transition-all shadow-sm text-sm ${
                (!tieneIngreso || tieneSalida || esEstadoBloqueado)
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-dashed"
                  : "cursor-pointer hover:opacity-95"
              }`}
              style={tieneIngreso && !tieneSalida && !esEstadoBloqueado ? { background: "linear-gradient(135deg,#0ea5e9,#3b82f6)" } : {}}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              {tieneSalida ? "Salida Registrada" : esEstadoBloqueado || !tieneIngreso ? "Salida Inhabilitada" : "Escanear QR Salida"}
            </button>
          </div>
        </Card>
      )}

      {/* COLACIÓN */}
      <Card title="Colación Informativa" icon="fa-utensils">
        <div className="space-y-3">
          <div className="text-sm text-center font-medium opacity-70 p-3 bg-gray-50 border border-dashed rounded-xl">
            Intervalo sugerido: {lunch?.startTime ?? "--:--"} a {lunch?.endTime ?? "--:--"}
          </div>
        </div>
      </Card>

      {/* HISTORIAL DIARIO */}
      {activeShiftId && (
        <Card title="Marcas Registradas de la Jornada" icon="fa-clock">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border bg-white/40">
              <div className="text-xs opacity-60 mb-1">Hora Entrada</div>
              <div className="font-bold text-base text-gray-800">
                {currentRecord?.checkIn ?? "--:--"}
              </div>
            </div>

            <div className="p-4 rounded-2xl border bg-white/40">
              <div className="text-xs opacity-60 mb-1">Hora Salida</div>
              <div className={`font-bold text-base ${currentRecord?.checkOut === "Pendiente" ? "text-amber-500 font-medium" : "text-gray-800"}`}>
                {currentRecord?.checkOut ?? "Pendiente"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* CORRECCIONES */}
      <Card title="Solicitudes y Correcciones" icon="fa-file-signature">
        <button
          className="w-full rounded-xl py-3.5 text-white font-semibold mb-4 cursor-pointer hover:opacity-95 transition-opacity text-sm"
          style={{ background: "linear-gradient(135deg,#6b21a8,#7c3aed)" }}
          onClick={() => alert("Módulo de justificaciones y apelación de atrasos en desarrollo.")}
        >
          <i className="fas fa-file-contract mr-2"></i>
          Ingresar Justificativo / Apelación
        </button>

        <div className="space-y-3">
          {corrections.length === 0 && (
            <div className="text-xs text-center opacity-50 py-2">
              No tienes solicitudes pendientes de revisión para este período.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}