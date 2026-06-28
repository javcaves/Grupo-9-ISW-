import { useEffect, useState } from "react";

import { Card } from "../../components/Card";
import { AuthService } from "../../api/auth.service";
import { AsistenciaService } from "../../api/asistencia.service";

export default function EmployeeAsistencia() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentShift, setCurrentShift] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [lunch, setLunch] = useState(null);
  const [corrections, setCorrections] = useState([]);

  // ⚠️ Esto depende de tu sistema (no lo tenemos aún expuesto)
  const idTurno = null;

  useEffect(() => {

    async function cargarDatos() {

      try {

        console.log("[Asistencia] Cargando usuario...");

        const res = await AuthService.me();
        console.log("[Asistencia] Auth.me =>", res);

        if (res?.success && res?.user) {
          setUser(res.user);
        }

        // ===============================
        // ASISTENCIA ACTUAL
        // ===============================
        if (idTurno) {

          console.log("[Asistencia] Consultando asistencia actual...");

          const asistencia = await AsistenciaService.obtenerActual(idTurno);

          console.log("[Asistencia] asistencia actual =>", asistencia);

          const data = asistencia?.data ?? asistencia;

          setCurrentRecord(data?.registroActual ?? null);
          setCurrentShift(data?.turno ?? null);
          setLunch(data?.lunch ?? null);

        } else {
          console.warn("[Asistencia] idTurno no definido aún");
        }

        // ===============================
        // CORRECCIONES (NO EXISTE ENDPOINT AÚN)
        // ===============================
        console.warn("[Asistencia] Correcciones aún no conectadas a backend");
        setCorrections([]);

      } catch (err) {
        console.error("[Asistencia] Error cargando datos:", err);
      } finally {
        setLoading(false);
      }

    }

    cargarDatos();

  }, []);

  // ===============================
  // ACTIONS
  // ===============================

  const marcarEntrada = async () => {
    try {
      console.log("[Asistencia] Marcando entrada...");

      const res = await AsistenciaService.marcar({
        tipo: "ENTRADA",
        id_turno: idTurno,
      });

      console.log("[Asistencia] Entrada registrada:", res);

    } catch (err) {
      console.error("[Asistencia] Error entrada:", err);
    }
  };

  const marcarSalida = async () => {
    try {
      console.log("[Asistencia] Marcando salida...");

      const res = await AsistenciaService.marcar({
        tipo: "SALIDA",
        id_turno: idTurno,
      });

      console.log("[Asistencia] Salida registrada:", res);

    } catch (err) {
      console.error("[Asistencia] Error salida:", err);
    }
  };

  if (loading) {
    return <div className="p-4">Cargando asistencia...</div>;
  }

  return (
    <div className="p-4 space-y-4 pb-24">

      {/* HEADER */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10">

        <h1 className="text-2xl font-bold" style={{ color: "var(--card-title)" }}>
          Asistencia
        </h1>

        <p className="mt-2" style={{ color: "var(--card-subtitle)" }}>
          Gestiona tu jornada laboral y registros diarios
        </p>

      </Card>

      {/* TURNO */}
      <Card title="Turno Actual" icon="fa-business-time">

        <div className="flex items-center gap-4">

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
            }}
          >
            <i className="fas fa-business-time text-xl"></i>
          </div>

          <div>

            <div className="font-bold text-lg">
              {currentShift?.start ?? "--"} - {currentShift?.end ?? "--"}
            </div>

            <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
              <i className="fas fa-circle text-xs"></i>
              {currentShift?.status ?? "Sin estado"}
            </div>

          </div>

        </div>

      </Card>

      {/* REGISTRO */}
      <Card title="Registro de Asistencia" icon="fa-qrcode">

        <div className="space-y-3">

          <button
            onClick={marcarEntrada}
            className="w-full rounded-xl py-4 text-white font-semibold"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
            }}
          >
            <i className="fas fa-qrcode mr-2"></i>
            Escanear QR Entrada
          </button>

          <button
            onClick={marcarSalida}
            className="w-full rounded-xl py-4 text-white font-semibold"
            style={{
              background: "linear-gradient(135deg,#0ea5e9,#3b82f6)",
            }}
          >
            <i className="fas fa-qrcode mr-2"></i>
            Escanear QR Salida
          </button>

        </div>

      </Card>

      {/* COLACIÓN */}
      <Card title="Colación" icon="fa-utensils">

        <div className="space-y-3">

          <div
            className="text-sm text-center"
            style={{ color: "var(--card-subtitle)" }}
          >
            Horario asignado:
            {" "}
            {lunch?.startTime ?? "--"}
            {" - "}
            {lunch?.endTime ?? "--"}
          </div>

        </div>

      </Card>

      {/* REGISTRO ACTUAL */}
      <Card title="Registro Actual" icon="fa-clock">

        <div className="grid grid-cols-2 gap-3">

          <div className="p-4 rounded-2xl border">
            <div className="text-sm mb-1">Entrada</div>
            <div className="font-bold text-lg">
              {currentRecord?.checkIn ?? "--"}
            </div>
          </div>

          <div className="p-4 rounded-2xl border">
            <div className="text-sm mb-1">Salida</div>
            <div className="font-bold text-lg text-amber-500">
              {currentRecord?.checkOut ?? "Pendiente"}
            </div>
          </div>

        </div>

      </Card>

      {/* CORRECCIONES */}
      <Card title="Solicitudes y Correcciones" icon="fa-file-signature">

        <button
          className="w-full rounded-xl py-4 text-white font-semibold mb-4"
          style={{
            background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
          }}
          onClick={() => console.log("[Asistencia] Solicitud corrección (TODO backend)")}
        >
          <i className="fas fa-file-signature mr-2"></i>
          Solicitar Corrección
        </button>

        <div className="space-y-3">

          {corrections.length === 0 && (
            <div className="text-sm text-center text-gray-500">
              No hay correcciones registradas
            </div>
          )}

          {corrections.map((correction) => (
            <div
              key={correction.id}
              className="p-3 rounded-xl border"
            >
              <div className="font-medium">{correction.date}</div>

              <div className="text-sm text-gray-500">
                {correction.reason}
              </div>

              <div className="mt-2 text-sm font-semibold">
                {correction.status}
              </div>
            </div>
          ))}

        </div>

      </Card>

    </div>
  );
}