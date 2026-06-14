import { Card } from "../../components/Card";
import { employeeData } from "../../data/employeeMockData";

export default function EmployeeAsistencia() {
  const {
    currentShift,
    currentRecord,
    lunch,
    corrections,
  } = employeeData.attendance;

  return (
    <div className="p-4 space-y-4 pb-24">

      {/* HEADER */}

      <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10">

        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--card-title)" }}
        >
          Asistencia
        </h1>

        <p
          className="mt-2"
          style={{ color: "var(--card-subtitle)" }}
        >
          Gestiona tu jornada laboral y registros diarios
        </p>

      </Card>

      {/* TURNO */}

      <Card
        title="Turno Actual"
        icon="fa-business-time"
      >
        <div className="flex items-center gap-4">

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
            style={{
              background:
                "linear-gradient(135deg,#7c3aed,#3b82f6)",
            }}
          >
            <i className="fas fa-business-time text-xl"></i>
          </div>

          <div>

            <div className="font-bold text-lg">
              {currentShift.start} - {currentShift.end}
            </div>

            <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
              <i className="fas fa-circle text-xs"></i>
              {currentShift.status}
            </div>

          </div>

        </div>
      </Card>

      {/* REGISTRO */}

      <Card
        title="Registro de Asistencia"
        icon="fa-qrcode"
      >

        <div className="space-y-3">

          <button
            className="w-full rounded-xl py-4 text-white font-semibold"
            style={{
              background:
                "linear-gradient(135deg,#7c3aed,#3b82f6)",
            }}
          >
            <i className="fas fa-qrcode mr-2"></i>
            Escanear QR Entrada
          </button>

          <button
            className="w-full rounded-xl py-4 text-white font-semibold"
            style={{
              background:
                "linear-gradient(135deg,#0ea5e9,#3b82f6)",
            }}
          >
            <i className="fas fa-qrcode mr-2"></i>
            Escanear QR Salida
          </button>

        </div>

      </Card>

      {/* COLACIÓN */}

      <Card
        title="Colación"
        icon="fa-utensils"
      >

        <div className="space-y-3">

          <button
            className="w-full rounded-xl py-4 text-white font-semibold"
            style={{
              background:
                "linear-gradient(135deg,#f59e0b,#f97316)",
            }}
          >
            <i className="fas fa-utensils mr-2"></i>
            Iniciar Colación
          </button>

          <button
            className="w-full rounded-xl py-4 text-white font-semibold"
            style={{
              background:
                "linear-gradient(135deg,#22c55e,#16a34a)",
            }}
          >
            <i className="fas fa-check mr-2"></i>
            Finalizar Colación
          </button>

          <div
            className="text-sm text-center"
            style={{ color: "var(--card-subtitle)" }}
          >
            Horario asignado:
            {" "}
            {lunch.startTime || "12:30"}
            {" - "}
            {lunch.endTime || "13:00"}
          </div>

        </div>

      </Card>

      {/* REGISTRO ACTUAL */}

      <Card
        title="Registro Actual"
        icon="fa-clock"
      >

        <div className="grid grid-cols-2 gap-3">

          <div
            className="p-4 rounded-2xl"
            style={{
              border: "1px solid var(--card-border)",
              background: "rgba(255,255,255,.5)",
            }}
          >
            <div
              className="text-sm mb-1"
              style={{ color: "var(--card-subtitle)" }}
            >
              Entrada
            </div>

            <div className="font-bold text-lg">
              {currentRecord.checkIn}
            </div>

          </div>

          <div
            className="p-4 rounded-2xl"
            style={{
              border: "1px solid var(--card-border)",
              background: "rgba(255,255,255,.5)",
            }}
          >
            <div
              className="text-sm mb-1"
              style={{ color: "var(--card-subtitle)" }}
            >
              Salida
            </div>

            <div className="font-bold text-lg text-amber-500">
              {currentRecord.checkOut || "Pendiente"}
            </div>

          </div>

        </div>

      </Card>

      {/* CORRECCIONES */}

      <Card
        title="Solicitudes y Correcciones"
        icon="fa-file-signature"
      >

        <button
          className="w-full rounded-xl py-4 text-white font-semibold mb-4"
          style={{
            background:
              "linear-gradient(135deg,#7c3aed,#3b82f6)",
          }}
        >
          <i className="fas fa-file-signature mr-2"></i>
          Solicitar Corrección
        </button>

        <div className="space-y-3">

          {corrections.map((correction) => (
            <div
              key={correction.id}
              className="p-3 rounded-xl"
              style={{
                border: "1px solid var(--card-border)",
              }}
            >
              <div className="font-medium">
                {correction.date}
              </div>

              <div
                className="text-sm"
                style={{ color: "var(--card-subtitle)" }}
              >
                {correction.reason}
              </div>

              <div
                className={`mt-2 text-sm font-semibold ${
                  correction.status === "Aprobada"
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {correction.status}
              </div>
            </div>
          ))}

        </div>

      </Card>

    </div>
  );
}