import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "../../components/Card";
import { AuthService } from "../../api/auth.service";
import { AsistenciaService } from "../../api/asistencia.service";
import QRScannerModal from "../../components/qr/QRScannerModal";
import SolicitarCorreccionAsistenciaModal from "../../components/modals/SolicitarCorreccionAsistenciaModal";
import { formatHora } from "../../utils/formatTime";
import { formatearFecha } from "../../utils/formatters";
import { useToast } from "../../context/ToastContext";

const ETIQUETAS_ESTADO_SOLICITUD = {
  PENDIENTE: { label: "Pendiente", className: "bg-amber-100 text-amber-700" },
  APROBADO: { label: "Aprobada", className: "bg-green-100 text-green-700" },
  RECHAZADO: { label: "Rechazada", className: "bg-red-100 text-red-700" },
};

export default function EmployeeAsistencia() {
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeShiftId, setActiveShiftId] = useState(location.state?.idTurno ?? null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiCode, setApiCode] = useState("");

  const [currentShift, setCurrentShift] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [lunch, setLunch] = useState(null);
  const [corrections, setCorrections] = useState([]);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [tipoMarcaje, setTipoMarcaje] = useState(null);
  const [registroActual, setRegistroActual] = useState(null);
  const [modalCorreccionAbierto, setModalCorreccionAbierto] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      try {
        console.log("🔍 [Asistencia] Iniciando carga...");
        let turnoIdFinal = activeShiftId;
        let objetoTurnoAux = null;

        // 1. Perfil del usuario
        const resMe = await AuthService.me();
        if (resMe?.success && resMe?.user) {
          setUser(resMe.user);
        }

        // 2. Recuperación autónoma del turno real del empleado (F5 / navegación directa)
        if (!turnoIdFinal) {
          const miTurnoRes = await AsistenciaService.obtenerMiTurno().catch(() => null);
          // El backend devuelve { success, message, data: { id_turno, nombre, ... } }
          const miTurno = miTurnoRes?.data ?? miTurnoRes ?? null;
          if (miTurno?.id_turno) {
            turnoIdFinal   = miTurno.id_turno;
            objetoTurnoAux = miTurno;
            setActiveShiftId(turnoIdFinal);
          }
        }

        // 3. Consulta de asistencia del día
        if (turnoIdFinal) {
          const asistenciaRes = await AsistenciaService.obtenerMiAsistenciaActual(turnoIdFinal).catch(err => {
            console.error("❌ [Asistencia] Falló la petición:", err);
            return null;
          });

          console.log("🔍 [RAW] asistenciaRes:", JSON.stringify(asistenciaRes, null, 2));

          // asistenciaRes = { code, data }  (el service ya hace response.data)
          const codigoApi  = asistenciaRes?.code;
          const registroDb = asistenciaRes?.data;

          console.log("📡 [FRONTEND] Payload:", { codigoApi, registroDb });

          if (codigoApi) setApiCode(codigoApi);

          if (registroDb) {
            // Guardamos el registro "crudo" (con su id_asistencia real) para
            // poder pasarlo tal cual a SolicitarCorreccionAsistenciaModal --
            // mismo shape que usa EmployeeHistorial.jsx.
            setRegistroActual({
              id_asistencia: registroDb.id_asistencia,
              fecha: registroDb.asistencia?.fecha ?? new Date().toISOString().slice(0, 10),
              hora_ingreso: registroDb.hora_ingreso,
              hora_egreso: registroDb.hora_egreso,
              estado: registroDb.estado,
            });

            // FIX: registroDb.hora_ingreso / hora_egreso son la hora REAL de
            // marcaje (normalmente un timestamp completo), no la hora
            // PROGRAMADA del turno. Antes se mostraban crudas (sin formatear),
            // por eso en mobile aparecía el timestamp completo o texto raro
            // en vez de "HH:MM". Se usa formatHora() para normalizar
            // cualquiera de los dos formatos que pueda devolver el backend.
            setCurrentRecord({
              checkIn:  formatHora(registroDb.hora_ingreso) ?? "--",
              checkOut: formatHora(registroDb.hora_egreso)  ?? "Pendiente",
              estado:   registroDb.estado       ?? "EN_ESPERA",
            });

            const tInfo = registroDb.asistencia?.turno;
            setCurrentShift({
              nombre: tInfo?.nombre                    ?? "Turno Operativo",
              start:  formatHora(tInfo?.hora_ingreso)   ?? "--:--",
              end:    formatHora(tInfo?.hora_salida)    ?? "--:--",
            });
            setLunch({
              startTime: formatHora(tInfo?.hora_inicio_colacion) || "13:00",
              endTime:   formatHora(tInfo?.hora_fin_colacion)    || "14:00",
            });

          } else {
            // FALLBACK: sin registro, usamos datos del turno recuperado.
            //
            // FIX: antes se forzaba estado "FUERA_DE_HORARIO" en TODOS los
            // casos sin registro, lo que bloqueaba el botón de Entrada
            // incluso dentro de la ventana de atraso en la que el empleado
            // SÍ debe poder marcar (solo que el backend lo registrará como
            // ATRASO en vez de PRESENTE, junto con la hora real de llegada).
            //
            // Ahora solo se bloquea cuando el backend confirma explícitamente
            // que no hay turno vigente hoy (SIN_TURNO_ASIGNADO). En cualquier
            // otro caso (incluido "ESPERANDO_INGRESO", que se mantiene
            // vigente durante toda la ventana de tolerancia/atraso) se deja
            // el estado en "EN_ESPERA" para no bloquear el marcaje: es el
            // backend quien decide PRESENTE vs ATRASO al procesar el scan.
            const estadoSinRegistro = codigoApi === "SIN_TURNO_ASIGNADO" ? "FUERA_DE_HORARIO" : "EN_ESPERA";
            setCurrentRecord({ checkIn: "--", checkOut: "Pendiente", estado: estadoSinRegistro });
            setRegistroActual(null);
            setCurrentShift({
              nombre: objetoTurnoAux?.nombre                  ?? "Turno General",
              start:  formatHora(objetoTurnoAux?.hora_ingreso) ?? "--:--",
              end:    formatHora(objetoTurnoAux?.hora_salida)  ?? "--:--",
            });
            setLunch({
              startTime: formatHora(objetoTurnoAux?.inicio_colacion) || "13:00",
              endTime:   formatHora(objetoTurnoAux?.fin_colacion)    || "14:00",
            });
          }
        }

        // Solicitudes de corrección ya elevadas (para no dejarlo siempre vacío)
        const solicitudesRes = await AsistenciaService.listarMisSolicitudes().catch((err) => {
          console.error("❌ Error cargando solicitudes de corrección:", err);
          return [];
        });
        setCorrections(solicitudesRes?.data ?? solicitudesRes ?? []);
      } catch (err) {
        console.error("[Asistencia] Error crítico:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, [activeShiftId]);

  function abrirScanner(tipo) {

    setTipoMarcaje(tipo);

    setScannerOpen(true);

}

// FIX: antes se leía datosQR.latitud/datosQR.longitud, pero useGeolocation.js
// devuelve las claves con sufijo "_emp" (latitud_emp/longitud_emp). Como esas
// propiedades no existían, siempre se enviaba undefined y el backend
// rechazaba la petición por validación (campos requeridos) — el marcaje
// nunca funcionaba, ni para entrada ni para salida.
//
// Además: QRScannerModal ya NO llama a la API por su cuenta (ver ese archivo);
// esta es ahora la ÚNICA llamada real a /asistencia/marcar. Por eso lanzamos
// el error (throw) en vez de hacer toast.error() acá: el modal lo captura y lo
// muestra, evitando la doble-llamada con datos cruzados que había antes.
async function registrarQR(datosQR) {

    const res = await AsistenciaService.marcar({

        token: datosQR.token,

        latitud_emp: datosQR.latitud_emp,

        longitud_emp: datosQR.longitud_emp,

        tipo: tipoMarcaje,

    });

    if (!res?.success) {
        throw new Error(res?.message || "No fue posible registrar la asistencia.");
    }

    toast.success("✅ " + (res.mensaje ?? "Asistencia registrada."));
    window.location.reload();
}

  if (loading) {
    return <div className="p-4 text-center font-medium">Sincronizando registros biométricos...</div>;
  }

  const estadoActual      = currentRecord?.estado ?? "EN_ESPERA";
  const tieneIngreso      = currentRecord?.checkIn  && currentRecord.checkIn  !== "--";
  const tieneSalida       = currentRecord?.checkOut && currentRecord.checkOut !== "Pendiente";
  const esEstadoBloqueado = ["RETIRADO", "FALTA_INJUSTIFICADA", "FALTA_JUSTIFICADA", "FUERA_DE_HORARIO"].includes(estadoActual)
                          || apiCode === "FIN_DE_SEMANA";

  // Indica si ya pasó la hora de ingreso programada del turno pero el
  // empleado todavía no marca. Es solo informativo: el botón sigue habilitado
  // (ver esEstadoBloqueado arriba) y es el backend quien decide, al procesar
  // el marcaje, si corresponde PRESENTE o ATRASO según la hora real de scan.
  function yaPasoHoraIngreso(horaInicio) {
    if (!horaInicio || horaInicio === "--:--") return false;
    const [h, m] = horaInicio.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return false;
    const ahora = new Date();
    const inicioTurno = new Date();
    inicioTurno.setHours(h, m, 0, 0);
    return ahora > inicioTurno;
  }

  const posibleAtraso = !tieneIngreso && !esEstadoBloqueado && yaPasoHoraIngreso(currentShift?.start);

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

      {/* ALERTAS DE CONTROL */}
      {apiCode === "FIN_DE_SEMANA" ? (
        <div className="p-4 rounded-xl text-sm font-medium border bg-blue-50 border-blue-200 text-blue-800">
          <i className="fas fa-umbrella-beach mr-2"></i>
          ¡Disfruta tu fin de semana! No registras mallas de turnos para el día de hoy.
        </div>
      ) : estadoActual === "FUERA_DE_HORARIO" || apiCode === "SIN_TURNO_ASIGNADO" ? (
        <div className="p-4 rounded-xl text-sm font-medium border bg-gray-50 border-gray-200 text-gray-600 shadow-sm">
          <div className="flex items-start gap-2">
            <i className="fas fa-clock mt-0.5 text-gray-400"></i>
            <div>
              <p className="font-semibold text-gray-800">No tienes un turno activo en este momento</p>
              <p className="text-xs opacity-80 mt-1">
                Tu jornada regular se reactivará el siguiente día hábil a las{" "}
                <span className="font-bold text-violet-700">{currentShift?.start ?? "--:--"} hrs</span>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        ["FALTA_INJUSTIFICADA", "FALTA_JUSTIFICADA", "RETIRADO"].includes(estadoActual) && (
          <div className={`p-4 rounded-xl text-sm font-medium border ${
            estadoActual === "FALTA_INJUSTIFICADA" ? "bg-red-50 border-red-200 text-red-800" :
            estadoActual === "FALTA_JUSTIFICADA"   ? "bg-amber-50 border-amber-200 text-amber-800" :
                                                     "bg-green-50 border-green-200 text-green-800"
          }`}>
            <i className="fas fa-circle-info mr-2"></i>
            {estadoActual === "FALTA_INJUSTIFICADA" && "Jornada Cerrada por Inasistencia Automática (Tolerancia Excedida)."}
            {estadoActual === "FALTA_JUSTIFICADA"   && "Día Libre / Ausencia Justificada autorizada por la empresa."}
            {estadoActual === "RETIRADO"            && "Has completado tu turno de hoy. Tu registro está cerrado con éxito."}
          </div>
        )
      )}

      {/* TURNO ASIGNADO */}
      {activeShiftId && (
        <Card title="Horario de Turno Asignado" icon="fa-business-time">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
            >
              <i className="fas fa-business-time text-xl"></i>
            </div>
            <div>
              <div className="font-bold text-lg">
                {currentShift?.start ?? "--:--"} - {currentShift?.end ?? "--:--"}
              </div>
              <div className="text-xs opacity-70 mb-1">{currentShift?.nombre ?? "Ventana Laboral"}</div>
              <div className={`mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                estadoActual === "PRESENTE"  ? "bg-green-100 text-green-700"  :
                estadoActual === "ATRASO"    ? "bg-amber-100 text-amber-700"  :
                estadoActual === "EN_ESPERA" ? "bg-violet-100 text-violet-700" :
                                               "bg-gray-100 text-gray-700"
              }`}>
                <i className="fas fa-circle text-[8px]"></i>
                {apiCode === "ESPERANDO_INGRESO" ? "EN ESPERA" : estadoActual.replace(/_/g, " ")}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* REGISTRO QR — el empleado SOLO escanea, nunca genera ni ve el QR.
          El QR vive únicamente en la pantalla de control del encargado. */}
      {activeShiftId && (
        <Card title="Escanear Código QR de Punto de Control" icon="fa-qrcode">
          <div className="space-y-3">
            {posibleAtraso && (
              <div className="p-3 rounded-xl text-xs font-medium border bg-amber-50 border-amber-200 text-amber-800 flex items-start gap-2">
                <i className="fas fa-triangle-exclamation mt-0.5"></i>
                <span>
                  Ya pasó tu hora de ingreso ({currentShift?.start} hrs). Puedes marcar igual: quedará
                  registrado con <strong>atraso</strong>, indicando tu hora real de llegada.
                </span>
              </div>
            )}
            <button
              onClick={() => abrirScanner("ENTRADA")}
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
              onClick={() => abrirScanner("SALIDA")}
              disabled={!tieneIngreso || tieneSalida || esEstadoBloqueado}
              className={`w-full rounded-xl py-4 text-white font-semibold transition-all shadow-sm text-sm ${
                (!tieneIngreso || tieneSalida || esEstadoBloqueado)
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-dashed"
                  : "cursor-pointer hover:opacity-95"
              }`}
              style={tieneIngreso && !tieneSalida && !esEstadoBloqueado ? { background: "linear-gradient(135deg,#0ea5e9,#3b82f6)" } : {}}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              {tieneSalida ? "Salida Registrada" : (esEstadoBloqueado || !tieneIngreso) ? "Salida Inhabilitada" : "Escanear QR Salida"}
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
      {activeShiftId && estadoActual !== "FUERA_DE_HORARIO" && (
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
              <div className={`font-bold text-base ${currentRecord?.checkOut === "Pendiente" ? "text-amber-500" : "text-gray-800"}`}>
                {currentRecord?.checkOut ?? "Pendiente"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* CORRECCIONES */}
      <Card title="Solicitudes y Correcciones" icon="fa-file-signature">
        <button
          className="w-full rounded-xl py-3.5 text-white font-semibold mb-4 cursor-pointer hover:opacity-95 transition-opacity text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#6b21a8,#7c3aed)" }}
          disabled={!registroActual}
          onClick={() => setModalCorreccionAbierto(true)}
        >
          <i className="fas fa-file-contract mr-2"></i>
          {registroActual ? "Solicitar Corrección de Hoy" : "Aún no hay registro de hoy para corregir"}
        </button>
        <div className="space-y-3">
          {corrections.length === 0 && (
            <div className="text-xs text-center opacity-50 py-2">
              No tienes solicitudes pendientes de revisión para este período.
            </div>
          )}
          {corrections.map((solicitud) => {
            const meta = ETIQUETAS_ESTADO_SOLICITUD[solicitud.estado_solicitud] || ETIQUETAS_ESTADO_SOLICITUD.PENDIENTE;
            return (
              <div key={solicitud.id_solicitud}
                className="flex items-center justify-between rounded-2xl p-3"
                style={{ background: "rgba(255,255,255,.75)", border: "1px solid var(--card-border)" }}>
                <div className="min-w-0">
                  <span className="text-xs font-medium">{formatearFecha(solicitud.fecha_solicitud)}</span>
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

      <SolicitarCorreccionAsistenciaModal
        isOpen={modalCorreccionAbierto}
        registro={registroActual}
        onClose={() => setModalCorreccionAbierto(false)}
        onSuccess={() => {
          setModalCorreccionAbierto(false);
          AsistenciaService.listarMisSolicitudes()
            .then((res) => setCorrections(res?.data ?? res ?? []))
            .catch(() => {});
        }}
      />

      <QRScannerModal

    open={scannerOpen}

    onClose={() => {

        setScannerOpen(false);

    }}

    onSuccess={registrarQR}

/>
    </div>
  );
}
