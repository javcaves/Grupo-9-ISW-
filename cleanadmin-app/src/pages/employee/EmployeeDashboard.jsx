import { useEffect, useState } from "react";

import { Card } from "../../components/Card";
import { AuthService } from "../../api/auth.service";
import { employeeData } from "../../data/employeeMockData";

export default function EmployeeDashboard() {

  const [employee, setEmployee] = useState(
    employeeData.dashboard.employee
  );

  const [loading, setLoading] = useState(true);

  // Estos siguen siendo mock hasta tener sus endpoints.
  const shift = employeeData.dashboard.shift;
  const today = employeeData.dashboard.today;
  const lunch = employeeData.dashboard.lunch;
  const tasks = employeeData.dashboard.tasks;
  const nextProject = employeeData.dashboard.nextProject;
  const notifications = employeeData.dashboard.notifications;

  useEffect(() => {

    async function cargarEmpleado() {

      try {

        const response = await AuthService.me();

        if (response?.success && response.user) {

          const usuario = response.user;

          const nombre = usuario.nombre ??
            employeeData.dashboard.employee.name;

          setEmployee({
            ...employeeData.dashboard.employee,

            id: usuario.id_usuario,

            name: nombre,

            initials:
              nombre
                .split(" ")
                .filter(Boolean)
                .map((palabra) => palabra[0])
                .join("")
                .substring(0, 2)
                .toUpperCase(),

            role:
              usuario.rol ??
              employeeData.dashboard.employee.role,

            email:
              usuario.correo ??
              employeeData.dashboard.employee.email,

          });

        }

      }
      catch (error) {

        console.error(
          "Error cargando empleado:",
          error
        );

      }
      finally {

        setLoading(false);

      }

    }

    cargarEmpleado();

  }, []);

  if (loading) {
    return (
      <div className="p-4">
        Cargando...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">

      {/* CABECERA */}

      <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10">

        <div className="flex items-center gap-4">

          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white"
            style={{
              background:
                "linear-gradient(135deg,#7c3aed,#3b82f6)",
            }}
          >
            {employee?.initials ?? "--"}
          </div>

          <div>

            <h2
              className="font-bold text-xl"
              style={{
                color: "var(--card-title)"
              }}
            >
              Hola {employee?.name ?? "Empleado"} 👋
            </h2>

            <p
              className="text-sm"
              style={{
                color: "var(--card-subtitle)"
              }}
            >
              Bienvenido a tu panel de trabajo
            </p>

            <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold">

              <i className="fas fa-clock"></i>

              {shift?.type ?? "--"} · {shift?.start ?? "--"} - {shift?.end ?? "--"}

            </div>

          </div>

        </div>

      </Card>

      {/* ESTADO DEL DÍA */}

      <Card title="Estado de Hoy" icon="fa-calendar-day">

        <div className="grid grid-cols-2 gap-3">

          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,.5)",
              border: "1px solid var(--card-border)"
            }}
          >
            <div
              className="text-xs mb-1"
              style={{ color: "var(--card-subtitle)" }}
            >
              Asistencia
            </div>

            <div className="font-bold">
              {today?.attendanceRegistered
                ? "✅ Registrada"
                : "❌ Pendiente"}
            </div>

          </div>

          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,.5)",
              border: "1px solid var(--card-border)"
            }}
          >

            <div
              className="text-xs mb-1"
              style={{ color: "var(--card-subtitle)" }}
            >
              Entrada
            </div>

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

          <div
            className="w-full h-3 rounded-full overflow-hidden"
            style={{
              background: "#e2e8f0"
            }}
          >

            <div
              className="h-full"
              style={{
                width: `${tasks?.progress ?? 0}%`,
                background:
                  "linear-gradient(90deg,#7c3aed,#3b82f6)"
              }}
            />

          </div>

          <div
            className="text-sm"
            style={{ color: "var(--card-subtitle)" }}
          >
            {tasks?.progress ?? 0}% completado
          </div>

        </div>

      </Card>

      {/* COLACIÓN */}

      <Card title="Colación" icon="fa-utensils">

        <div className="flex items-center gap-3">

          <i className="fas fa-utensils text-xl"></i>

          <div>

            <div className="font-semibold">
              {lunch?.start ?? "--"} - {lunch?.end ?? "--"}
            </div>

            <div
              className="text-sm"
              style={{ color: "var(--card-subtitle)" }}
            >
              Horario asignado
            </div>

          </div>

        </div>

      </Card>

      {/* PROYECTO */}

      <Card title="Próximo Proyecto" icon="fa-building">

        <div className="flex gap-4 items-center">

          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
            style={{
              background:
                "linear-gradient(135deg,#7c3aed,#3b82f6)"
            }}
          >
            <i className="fas fa-building"></i>
          </div>

          <div>

            <div className="font-semibold">
              {nextProject?.name ?? "Sin proyecto"}
            </div>

            <div
              className="text-sm"
              style={{ color: "var(--card-subtitle)" }}
            >
              {nextProject?.areas?.join(" • ") ?? "--"}
            </div>

          </div>

        </div>

      </Card>

      {/* ACCIONES */}

      <Card title="Acciones Rápidas" icon="fa-bolt">

        <div className="space-y-3">

          <button
            className="w-full rounded-xl py-3 font-semibold text-white"
            style={{
              background:
                "linear-gradient(135deg,#7c3aed,#3b82f6)"
            }}
          >
            <i className="fas fa-fingerprint mr-2"></i>
            Registrar Asistencia
          </button>

          <button
            className="w-full rounded-xl py-3 font-semibold text-white"
            style={{
              background:
                "linear-gradient(135deg,#7c3aed,#3b82f6)"
            }}
          >
            <i className="fas fa-list-check mr-2"></i>
            Ver Tareas
          </button>

        </div>

      </Card>

      {/* NOTIFICACIONES */}

      <Card title="Notificaciones" icon="fa-bell">

        <div className="space-y-3">

          {(notifications ?? []).map((notification) => (

            <div
              key={notification.id}
              className="flex gap-3 pb-3 border-b last:border-none"
            >

              <i className="fas fa-bell text-violet-500 mt-1"></i>

              <div>

                <div className="font-medium">
                  {notification.message}
                </div>

                <div
                  className="text-xs"
                  style={{
                    color: "var(--card-subtitle)"
                  }}
                >
                  {notification.createdAt}
                </div>

              </div>

            </div>

          ))}

        </div>

      </Card>

    </div>
  );

}