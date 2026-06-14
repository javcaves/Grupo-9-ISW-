import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card";
import { employeeData } from "../../data/employeeMockData";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeHistorial() {
  const {
    monthlySummary,
    attendanceHistory,
    taskHistory,
    appeals,
  } = employeeData.history;

  const navigate = useNavigate();

  const { logoutUser } = useAuth();

  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "¿Deseas cerrar sesión?"
    );

    if (!confirmLogout) return;

    await logoutUser();

    navigate("/login");
  };

  return (
    <div className="p-4 space-y-4">

      {/* HEADER */}

      <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--card-title)" }}
          >
            Historial
          </h1>

          <p
            className="text-sm mt-1"
            style={{ color: "var(--card-subtitle)" }}
          >
            Revisa tu asistencia, tareas y registros anteriores
          </p>
        </div>
      </Card>

      {/* RESUMEN */}

      <Card
        title="Resumen Mensual"
        icon="fa-chart-column"
      >
        <div className="grid grid-cols-3 gap-3">

          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: "rgba(255,255,255,.75)",
              border: "1px solid var(--card-border)",
            }}
          >
            <i className="fas fa-calendar-check text-blue-500 text-xl mb-2" />

            <div className="text-2xl font-bold">
              {monthlySummary.workedDays}
            </div>

            <div className="text-xs text-gray-500">
              Días
            </div>
          </div>

          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: "rgba(255,255,255,.75)",
              border: "1px solid var(--card-border)",
            }}
          >
            <i className="fas fa-clock text-amber-500 text-xl mb-2" />

            <div className="text-2xl font-bold">
              {monthlySummary.delays}
            </div>

            <div className="text-xs text-gray-500">
              Retrasos
            </div>
          </div>

          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: "rgba(255,255,255,.75)",
              border: "1px solid var(--card-border)",
            }}
          >
            <i className="fas fa-user-check text-green-500 text-xl mb-2" />

            <div className="text-2xl font-bold">
              {monthlySummary.absences}
            </div>

            <div className="text-xs text-gray-500">
              Ausencias
            </div>
          </div>

        </div>
      </Card>

      {/* ASISTENCIA */}

      <Card
        title="Historial de Asistencia"
        icon="fa-calendar-days"
      >
        <div className="space-y-3">

          {attendanceHistory.map((record) => (
            <div
              key={record.id}
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,.75)",
                border: "1px solid var(--card-border)",
              }}
            >
              <div className="font-semibold mb-3">
                {record.date}
              </div>

              <div className="flex justify-between text-sm">
                <span>Entrada</span>
                <strong>{record.checkIn}</strong>
              </div>

              <div className="flex justify-between text-sm mt-2">
                <span>Salida</span>
                <strong>{record.checkOut}</strong>
              </div>
            </div>
          ))}

        </div>
      </Card>

      {/* TAREAS */}

      <Card
        title="Historial de Tareas"
        icon="fa-list-check"
      >
        <div className="flex items-center gap-4">

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl"
            style={{
              background:
                "linear-gradient(135deg,#7c3aed,#3b82f6)",
            }}
          >
            <i className="fas fa-list-check" />
          </div>

          <div>
            <div className="text-3xl font-bold">
              {taskHistory.completedTasks}
            </div>

            <p className="text-sm text-gray-500">
              Tareas completadas
            </p>
          </div>

        </div>

        <div className="mt-4 space-y-2">

          {taskHistory.lastCompleted.map((task) => (
            <div
              key={task}
              className="flex items-center gap-2 text-sm"
            >
              <i className="fas fa-check-circle text-green-500" />
              {task}
            </div>
          ))}

        </div>
      </Card>

      {/* APELACIONES */}

      <Card
        title="Apelaciones"
        icon="fa-file-signature"
      >
        <div className="space-y-3">

          {appeals.map((appeal) => (
            <div
              key={appeal.id}
              className="flex items-center justify-between rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,.75)",
                border: "1px solid var(--card-border)",
              }}
            >
              <span>{appeal.date}</span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  appeal.status === "Aprobada"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {appeal.status}
              </span>
            </div>
          ))}

        </div>
      </Card>

      {/* LOGOUT */}

      <Card>

        <button
          onClick={handleLogout}
          className="
            w-full

            flex
            items-center
            justify-center
            gap-3

            py-4

            rounded-2xl

            text-white
            font-semibold

            transition-all
            duration-300

            hover:scale-[1.02]
            active:scale-[0.98]

            shadow-lg
            shadow-red-500/20
          "
          style={{
            background:
              "linear-gradient(135deg,#dc2626,#ef4444)",
          }}
        >
          <i className="fas fa-right-from-bracket" />

          Cerrar Sesión
        </button>

      </Card>

    </div>
  );
}