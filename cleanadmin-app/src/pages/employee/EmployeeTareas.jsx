import { Card } from "../../components/Card";
import { employeeData } from "../../data/employeeMockData";

export default function EmployeeTareas() {
  const {
    summary,
    list,
    team,
    inventory,
  } = employeeData.tasks;

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-600";
      case "Media":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pendiente":
        return "bg-red-100 text-red-600";
      case "En Progreso":
        return "bg-blue-100 text-blue-600";
      case "Completada":
        return "bg-green-100 text-green-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getTaskIcon = (title) => {
    if (title.toLowerCase().includes("baño"))
      return "fa-broom";

    if (
      title.toLowerCase().includes("insumo")
    )
      return "fa-boxes-stacked";

    if (
      title.toLowerCase().includes("basura")
    )
      return "fa-trash";

    return "fa-list-check";
  };

  return (
    <div className="p-4 space-y-4 pb-24">

      {/* HEADER */}

      <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10">

        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--card-title)" }}
        >
          Tareas
        </h1>

        <p
          className="mt-2"
          style={{ color: "var(--card-subtitle)" }}
        >
          Gestiona tus actividades y avances diarios
        </p>

      </Card>

      {/* RESUMEN */}

      <Card
        title="Resumen"
        icon="fa-chart-simple"
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
              style={{
                color: "var(--card-subtitle)",
              }}
            >
              Asignadas
            </div>

            <div className="text-2xl font-bold">
              {summary.assigned}
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
              style={{
                color: "var(--card-subtitle)",
              }}
            >
              Completadas
            </div>

            <div className="text-2xl font-bold">
              {summary.completed}
            </div>
          </div>

        </div>

      </Card>

      {/* TAREAS */}

      <Card
        title="Mis Tareas"
        icon="fa-list-check"
      >

        <div className="space-y-4">

          {list.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl"
              style={{
                border: "1px solid var(--card-border)",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,.95), rgba(248,250,252,.95))",
              }}
            >

              <div className="flex items-center gap-3 mb-4">

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{
                    background:
                      "linear-gradient(135deg,#7c3aed,#3b82f6)",
                  }}
                >
                  <i
                    className={`fas ${getTaskIcon(task.title)}`}
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    {task.title}
                  </h3>

                  <p
                    className="text-sm"
                    style={{
                      color: "var(--card-subtitle)",
                    }}
                  >
                    {task.estimatedMinutes} min
                  </p>
                </div>

              </div>

              <p
                className="text-sm mb-4"
                style={{
                  color: "var(--card-subtitle)",
                }}
              >
                {task.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">

                <span
                  className={`px-3 py-2 rounded-full text-xs font-semibold ${getPriorityClass(task.priority)}`}
                >
                  Prioridad {task.priority}
                </span>

                <span
                  className={`px-3 py-2 rounded-full text-xs font-semibold ${getStatusClass(task.status)}`}
                >
                  {task.status}
                </span>

              </div>

              <button
                className="w-full rounded-xl py-3 text-white font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg,#7c3aed,#3b82f6)",
                }}
              >
                Ver Detalle
              </button>

            </div>
          ))}

        </div>

      </Card>

      {/* EQUIPO */}

      <Card
        title="Equipo de Trabajo"
        icon="fa-users"
      >

        <div className="space-y-3">

          {team.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{
                border: "1px solid var(--card-border)",
              }}
            >
              <i className="fas fa-user text-violet-500" />

              <div>
                <div className="font-medium">
                  {member.name}
                </div>

                <div
                  className="text-sm"
                  style={{
                    color: "var(--card-subtitle)",
                  }}
                >
                  {member.role}
                </div>
              </div>

            </div>
          ))}

        </div>

      </Card>

      {/* INVENTARIO */}

      <Card
        title="Inventario Relacionado"
        icon="fa-box"
      >

        <div className="space-y-3">

          {inventory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{
                border: "1px solid var(--card-border)",
              }}
            >
              <div className="flex items-center gap-3">

                <i className="fas fa-box text-violet-500" />

                <span>{item.name}</span>

              </div>

              <span className="font-semibold">
                {item.stock}
              </span>

            </div>
          ))}

        </div>

      </Card>

    </div>
  );
}