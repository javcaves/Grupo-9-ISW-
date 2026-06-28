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

  // Guardamos el id en un estado dinámico local para poder alterarlo si lo descubrimos de forma independiente
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
        console.log("[Asistencia] Iniciando carga de datos inteligente...");
        let turnoIdFinal = activeShiftId;

        // 1. Cargar perfil del usuario actual
        const resMe = await AuthService.me();
        console.log("[Asistencia] Auth.me =>", resMe);

        if (resMe?.success && resMe?.user) {
          setUser(resMe.user);
        }

        // 🔍 PLAN DE RESPALDO: Si no hay idTurno (ej. F5 o ingreso directo por URL)
        if (!turnoIdFinal) {
          console.log("[Asistencia] ⚠️ No hay idTurno en el state del router. Recuperando de forma autónoma...");
          
          // Buscamos sus proyectos
          const proyectosRes = await ProyectoService.listar().catch(() => []);
          const proyectos = Array.isArray(proyectosRes) ? proyectosRes : (proyectosRes?.data ?? []);
          const proyectoActual = proyectos[0] ?? null;

          if (proyectoActual?.id_proyecto) {
            console.log(`[Asistencia] Proyecto recuperado: ID ${proyectoActual.id_proyecto}. Buscando turnos...`);
            const turnoRes = await TurnoService.listarPorProyecto(proyectoActual.id_proyecto).catch(() => null);
            const listaTurnos = Array.isArray(turnoRes) ? turnoRes : (turnoRes?.data ?? []);
            const turnoActual = listaTurnos[0] ?? null;

            if (turnoActual?.id_turno) {
              console.log(`[Asistencia] ✅ Turno recuperado con éxito: ID ${turnoActual.id_turno}`);
              turnoIdFinal = turnoActual.id_turno;
              setActiveShiftId(turnoIdFinal); // Guardamos en el estado local
            }
          }
        }

        // 2. Si logramos tener un ID de turno (vía router o vía recuperación autónoma)
        if (turnoIdFinal) {
          console.log(`[Asistencia] Consultando marcas de asistencia de hoy para el Turno ID: ${turnoIdFinal}`);
          const asistenciaRes = await AsistenciaService.obtenerMiAsistenciaActual(turnoIdFinal).catch(err => {
            console.error("❌ Error consumiendo asistencia actual:", err);
            return null;
          });

          console.log("[Asistencia] Respuesta del servidor:", asistenciaRes);

          if (asistenciaRes?.success && asistenciaRes?.data) {
            const registroDb = asistenciaRes.data;
            setCurrentRecord({
              checkIn: registroDb.hora_ingreso ?? "--",
              checkOut: registroDb.hora_egreso ?? "Pendiente",
              estado: registroDb.estado ?? "EN_ESPERA"
            });

            if (registroDb.asistencia?.turno) {
              const t = registroDb.asistencia.turno;
              setCurrentShift({
                nombre: t.nombre ?? "Turno",
                start: t.hora_ingreso ?? "--",
                end: t.hora_salida ?? "--",
                status: registroDb.estado ?? "Asignado"
              });
            }
          } else {
            // No hay registros previos pero el turno existe, intentamos pintar el horario del turno
            // Buscando los datos desde el objeto recuperado en el bloque anterior si corresponde
            setCurrentRecord(null);
          }
        } else {
          console.warn("[Asistencia] ❌ Fue imposible recuperar un Turno Activo para este empleado.");
        }

        // Colación y Estáticos
        setLunch({ startTime: "13:00", endTime: "14:00" });
        setCorrections([]);

      } catch (err) {
        console.error("[Asistencia] Error crítico cargando datos de pantalla:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, [activeShiftId]);

  // =====================================================================
  // ACCIONES DE MARCAJE (RF-ASISTENCIA-6)
  // =====================================================================

  const marcarEntrada = async () => {
    try {
      if (!activeShiftId) return alert("Error: No hay un turno asociado para efectuar la marca.");
      console.log("[Asistencia] Solicitando marcaje de Entrada...");

      const res = await AsistenciaService.marcar({
        tipo: "ENTRADA",
        id_turno: Number(activeShiftId)
      });

      if (res?.success) {
        alert("✅ Entrada registrada correctamente.");
        window.location.reload();
      } else {
        alert(`❌ No se pudo marcar: ${res?.message || "Error desconocido"}`);
      }
    } catch (err) {
      console.error("[Asistencia] Error registrando entrada:", err);
    }
  };

  const marcarSalida = async () => {
    try {
      if (!activeShiftId) return alert("Error: No hay un turno asociado para efectuar la marca.");
      console.log("[Asistencia] Solicitando marcaje de Salida...");

      const res = await AsistenciaService.marcar({
        tipo: "SALIDA",
        id_turno: Number(activeShiftId)
      });

      if (res?.success) {
        alert("✅ Salida registrada correctamente.");
        window.location.reload();
      } else {
        alert(`❌ No se pudo marcar: ${res?.message || "Error desconocido"}`);
      }
    } catch (err) {
      console.error("[Asistencia] Error registrando salida:", err);
    }
  };

  if (loading) {
    return <div className="p-4 text-center font-medium">Cargando asistencia...</div>;
  }

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
        <p className="mt-2" style={{ color: "var(--card-subtitle)" }}>
          Gestiona tu jornada laboral y registros diarios
        </p>
      </Card>

      {/* ALERTA EN CASO DE HUÉRFANO DE TURNO */}
      {!activeShiftId && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm font-medium">
          ⚠️ No tienes un turno activo asignado en este momento. Vuelve al panel e inicia un proyecto.
        </div>
      )}

      {/* TURNO */}
      {activeShiftId && (
        <Card title="Turno Asignado" icon="fa-business-time">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
            >
              <i className="fas fa-business-time text-xl"></i>
            </div>
            <div>
              <div className="font-bold text-lg">
                {currentShift?.start ?? "--"} - {currentShift?.end ?? "--"}
              </div>
              <div className="text-xs opacity-70 mb-1">{currentShift?.nombre ?? "Horario Laboral"}</div>
              <div className={`mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                currentRecord?.estado === "PRESENTE" ? "bg-green-100 text-green-700" :
                currentRecord?.estado === "ATRASO" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"
              }`}>
                <i className="fas fa-circle text-[10px]"></i>
                {currentRecord?.estado ?? "EN_ESPERA"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* REGISTRO */}
      {activeShiftId && (
        <Card title="Registro de Asistencia" icon="fa-qrcode">
          <div className="space-y-3">
            <button
              onClick={marcarEntrada}
              disabled={!!currentRecord?.checkIn && currentRecord.checkIn !== "--"}
              className={`w-full rounded-xl py-4 text-white font-semibold transition-all shadow-sm ${
                currentRecord?.checkIn && currentRecord.checkIn !== "--"
                  ? "bg-gray-300 opacity-60 cursor-not-allowed"
                  : "cursor-pointer hover:opacity-95"
              }`}
              style={!(currentRecord?.checkIn && currentRecord.checkIn !== "--") ? { background: "linear-gradient(135deg,#7c3aed,#3b82f6)" } : {}}
            >
              <i className="fas fa-qrcode mr-2"></i>
              {currentRecord?.checkIn && currentRecord.checkIn !== "--" ? "Entrada Registrada" : "Escanear QR Entrada"}
            </button>

            <button
              onClick={marcarSalida}
              disabled={!currentRecord?.checkIn || currentRecord.checkIn === "--" || (currentRecord?.checkOut && currentRecord.checkOut !== "Pendiente")}
              className={`w-full rounded-xl py-4 text-white font-semibold transition-all shadow-sm ${
                (!currentRecord?.checkIn || currentRecord.checkIn === "--" || (currentRecord?.checkOut && currentRecord.checkOut !== "Pendiente"))
                  ? "bg-gray-300 opacity-60 cursor-not-allowed"
                  : "cursor-pointer hover:opacity-95"
              }`}
              style={currentRecord?.checkIn && currentRecord.checkIn !== "--" && currentRecord?.checkOut === "Pendiente" ? { background: "linear-gradient(135deg,#0ea5e9,#3b82f6)" } : {}}
            >
              <i className="fas fa-qrcode mr-2"></i>
              {currentRecord?.checkOut && currentRecord.checkOut !== "Pendiente" ? "Salida Registrada" : "Escanear QR Salida"}
            </button>
          </div>
        </Card>
      )}

      {/* COLACIÓN */}
      <Card title="Colación" icon="fa-utensils">
        <div className="space-y-3">
          <div className="text-sm text-center font-medium opacity-70 p-2 bg-gray-50 border border-dashed rounded-xl">
            Horario sugerido: {lunch?.startTime ?? "--"} - {lunch?.endTime ?? "--"}
          </div>
        </div>
      </Card>

      {/* REGISTRO ACTUAL */}
      {activeShiftId && (
        <Card title="Registro Actual" icon="fa-clock">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border bg-white/40">
              <div className="text-sm opacity-70 mb-1">Entrada</div>
              <div className="font-bold text-lg">
                {currentRecord?.checkIn ?? "--"}
              </div>
            </div>

            <div className="p-4 rounded-2xl border bg-white/40">
              <div className="text-sm opacity-70 mb-1">Salida</div>
              <div className={`font-bold text-lg ${currentRecord?.checkOut === "Pendiente" ? "text-amber-500" : "text-gray-800"}`}>
                {currentRecord?.checkOut ?? "Pendiente"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* CORRECCIONES */}
      <Card title="Solicitudes y Correcciones" icon="fa-file-signature">
        <button
          className="w-full rounded-xl py-4 text-white font-semibold mb-4 cursor-pointer hover:opacity-95 transition-opacity"
          style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
          onClick={() => alert("Módulo de justificaciones en desarrollo.")}
        >
          <i className="fas fa-file-signature mr-2"></i>
          Solicitar Corrección
        </button>

        <div className="space-y-3">
          {corrections.length === 0 && (
            <div className="text-sm text-center opacity-50 py-2">
              No hay correcciones registradas para esta quincena.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}