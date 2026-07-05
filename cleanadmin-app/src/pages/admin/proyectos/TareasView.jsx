// pages/admin/proyectos/TareasView.jsx
import { useState, useEffect } from "react";
import LayoutContent from "../../../layouts/LayoutContent";
import { Card } from "../../../components/Card";
import { Table } from "../../../components/Table";
import ProgramarTarea from "../../../components/modals/ProgramarTarea";
import AsignarTarea from "../../../components/modals/AsignarTarea";
import EliminarTarea from "../../../components/modals/EliminarTarea";
import { ActividadesService } from "../../../api/actividades.service";
import { TareaService } from "../../../api/tareas.service";
import { ProyectoUsuarioService } from "../../../api/proyecto_usuario.service";
import { FaListUl, FaCircleCheck, FaSpinner, FaTriangleExclamation } from "react-icons/fa6";

export default function TareasView({ proyecto }) {
  const [actividadesProyecto, setActividadesProyecto] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Modales
  const [abrirProgramar, setAbrirProgramar] = useState(false);
  const [abrirAsignar, setAbrirAsignar] = useState(false);
  const [abrirCancelar, setAbrirCancelar] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

  async function cargarDatos() {
    setLoading(true);
    try {
      const idProy = proyecto?.id_proyecto;
      if (!idProy) return;

      const [resAct, resTar, resEmp] = await Promise.all([
        ActividadesService.listar().catch(() => []),
        TareaService.listar().catch(() => []),
        ProyectoUsuarioService.listarUsuarios(idProy).catch(() => [])
      ]);

      const actividadesFiltradas = (resAct?.data ?? resAct ?? []).filter(
        a => a.proyecto?.id_proyecto === idProy
      );
      setActividadesProyecto(actividadesFiltradas);

      const idsActividadesProyecto = actividadesFiltradas.map(a => a.id_act);
      const tareasFiltradas = (resTar?.data ?? resTar ?? []).filter(
        t => idsActividadesProyecto.includes(t.actividad?.id_act)
      ).map(t => {
        const actCompleta = actividadesFiltradas.find(a => a.id_act === t.actividad?.id_act);
        return {
          ...t,
          actividad: actCompleta || t.actividad 
        };
      });
      setTareasPendientes(tareasFiltradas);

      const empleadosMapeados = (resEmp?.data ?? resEmp ?? []).map(item => {
        if (item.usuario) {
          return { ...item.usuario, rol: item.rol }; 
        }
        return item;
      });
      setEmpleados(empleadosMapeados);

    } catch (err) {
      console.error("TareasView cargarDatos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarDatos(); }, [proyecto?.id_proyecto]);

  const totalTareas = tareasPendientes.length;
  const finalizadas = tareasPendientes.filter(t => t.estado === "FINALIZADA").length;
  const enProceso = tareasPendientes.filter(t => t.estado === "EN_PROCESO").length;
  const incompletas = tareasPendientes.filter(t => ["CANCELADA", "INCOMPLETA"].includes(t.estado)).length;

  const porcentajeCompletado = totalTareas === 0 ? 0 : Math.round((finalizadas / totalTareas) * 100);

  const statsCards = [
    { title: "Tareas Totales", number: totalTareas, icon: FaListUl, detail: "En la jornada actual" },
    { title: "Finalizadas", number: finalizadas, icon: FaCircleCheck, detail: `${porcentajeCompletado}% Completado` },
    { title: "En Proceso", number: enProceso,   icon: FaSpinner, detail: "En ejecución" },
    { title: "Incompletas / Atraso", number: incompletas, icon: FaTriangleExclamation, detail: "Requieren atención", alert: true },
  ];

  const acciones = [
    { text: "Programar Tarea", className: "bg-indigo-600 text-white", onClick: () => setAbrirProgramar(true) },
  ];

  const COLUMNAS_TAREAS = [
    {
      key: "tarea_categoria",
      label: "Tarea y categoría",
      icon: "fa-clipboard-list",
      render: (_, tarea) => {
        const actividadCompleta = actividadesProyecto.find(a => a.id_act === tarea.actividad?.id_act);
        const nombreCategoria = actividadCompleta?.categoria?.nombre || tarea.actividad?.categoria?.nombre || "General";
        const nombreActividad = tarea.actividad?.descripcion_esp || actividadCompleta?.descripcion_esp || "Sin nombre";

        return (
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 text-sm">{nombreActividad}</span>
            <span className="text-xs text-gray-400 mt-0.5">{nombreCategoria}</span>
          </div>
        );
      },
    },
    {
      key: "empleado_asignado",
      label: "Empleado Asignado",
      icon: "fa-user",
      render: (_, tarea) => {
        const asignaciones = tarea.asignaciones ?? [];
        const asignacionActual = asignaciones.length
          ? [...asignaciones].sort((a, b) => new Date(b.hora_asignacion) - new Date(a.hora_asignacion))[0]
          : null;
        const empleado = asignacionActual?.empleado;

        if (!empleado) {
          return <span className="text-gray-400 text-sm font-medium italic">Sin asignar</span>;
        }

        return (
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 text-sm">{empleado.nombre} {empleado.apellido}</span>
          </div>
        );
      },
    },
    {
      key: "horario",
      label: "Horario",
      icon: "fa-clock",
      render: (_, tarea) => (
        <span className="text-sm text-gray-600 font-medium">
          {tarea.hora ? `${tarea.fecha} • ${tarea.hora}` : "Indefinido"}
        </span>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      icon: "fa-flag",
      render: (val) => {
        const styles = {
          PLANIFICADA: "bg-slate-100 text-slate-600",
          ASIGNADA: "bg-blue-50 text-blue-600",
          EN_PROCESO: "bg-amber-100 text-amber-700",
          FINALIZADA: "bg-green-50 text-green-600",
          INCOMPLETA: "bg-red-50 text-red-600",
          CANCELADA: "bg-red-50 text-red-600",
        };
        const badgeStyle = styles[val] || "bg-gray-100 text-gray-600";
        return (
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${badgeStyle}`}>
            {val ? val.replace("_", " ") : "DESCONOCIDO"}
          </span>
        );
      },
    },
    { key: "actions", label: "Acciones" },
  ];

  const tablaContenido = loading ? (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  ) : (
    <Table
      columns={COLUMNAS_TAREAS}
      data={tareasPendientes}
      emptyMessage="No hay tareas programadas para este proyecto."
      onEdit={(item) => {
        setTareaSeleccionada(item);
        setAbrirAsignar(true);
      }}
      onDelete={(item) => {
        setTareaSeleccionada(item);
        setAbrirCancelar(true);
      }}
    />
  );

  return (
    <>
      <LayoutContent
        header={{
          title: "Flujo de Trabajo Diario",
          subtitle: "Monitoreo y asignación de tareas operativas",
        }}
        actions={acciones}
        stats={
          <>
            {statsCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card
                  key={index}
                  hoverable
                  className="rounded-[28px] overflow-hidden relative min-h-[170px]"
                  decorator={
                    <div
                      className="absolute top-[-20px] right-[-20px] w-[110px] h-[110px] rounded-full"
                      style={{ backgroundColor: card.alert ? "rgba(239, 68, 68, 0.1)" : "var(--card-decorator-bg)" }}
                    />
                  }
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <span style={{ color: "var(--card-label-text)" }} className="font-semibold text-[1rem]">
                      {card.title}
                    </span>
                    <h2 className="text-[3rem] leading-none font-bold mt-5" style={{ color: "var(--card-number-text)" }}>
                      {card.number}
                    </h2>
                    <div className="flex items-center gap-2 mt-5 text-sm" style={{ color: card.alert ? "#ef4444" : "var(--card-detail-text)" }}>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ 
                          backgroundColor: card.alert ? "rgba(239, 68, 68, 0.1)" : "var(--card-icon-wrapper-bg)", 
                          color: card.alert ? "#ef4444" : "var(--card-icon-wrapper-text)" 
                        }}
                      >
                        <Icon size={14} />
                      </div>
                      <span>{card.detail}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </>
        }
        table={tablaContenido}
      />

      <ProgramarTarea
        isOpen={abrirProgramar}
        onClose={() => setAbrirProgramar(false)}
        actividades={actividadesProyecto}
        actualizarLista={cargarDatos}
      />
      
      <AsignarTarea
        isOpen={abrirAsignar}
        onClose={() => { setAbrirAsignar(false); setTareaSeleccionada(null); }}
        tareasPendientes={tareasPendientes}
        empleados={empleados}
        tareaPreseleccionada={tareaSeleccionada}
        actualizarLista={cargarDatos}
      />

      {abrirCancelar && (
        <EliminarTarea
          isOpen={abrirCancelar}
          onClose={() => { setAbrirCancelar(false); setTareaSeleccionada(null); }}
          tareaSeleccionada={tareaSeleccionada}
          actualizarLista={cargarDatos}
        />
      )}
    </>
  );
}