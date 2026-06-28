// pages/admin/proyectos/ActividadesView.jsx
import { useState, useEffect }  from "react";
import LayoutContent            from "../../../layouts/LayoutContent";
import { Card }                 from "../../../components/Card";
import { Table }                from "../../../components/Table";
import CrearActividad           from "../../../components/modals/CrearActividad";
import ProgramarTarea           from "../../../components/modals/ProgramarTarea";
import AsignarTarea             from "../../../components/modals/AsignarTarea";
import { CategoriaService }     from "../../../api/categorias.service";
import { ActividadesService }   from "../../../api/actividades.service";
import { TareaService }         from "../../../api/tareas.service";
import { UsuarioService }       from "../../../api/usuario.service";
import { FaClipboardCheck, FaCalendarCheck, FaListCheck, FaRotate } from "react-icons/fa6";

const COLUMNAS_ACTIVIDADES = [
  {
    key:   "descripcion_esp",
    label: "Actividad",
    icon:  "fa-bolt",
    render: (val) => (
      <span className="font-semibold text-slate-700">{val ?? "—"}</span>
    ),
  },
  {
    key:   "categoria",
    label: "Categoría",
    icon:  "fa-tag",
    render: (val) => val?.nombre ?? "—",
  },
  {
    key:   "recurrencia",
    label: "Recurrencia",
    icon:  "fa-rotate",
    render: (val) => (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-600">
        {val ?? "ÚNICA"}
      </span>
    ),
  },
  {
    key:   "proyecto",
    label: "Proyecto",
    icon:  "fa-building",
    render: (val) => val?.nombre_proy ?? "—",
  },
  {
    key:   "activo",
    label: "Estado",
    render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
        {val ? "Activa" : "Inactiva"}
      </span>
    ),
  },
  { key: "actions", label: "Acciones" },
];

export default function ActividadesView({ proyecto }) {
  const [listaCategorias,       setListaCategorias]       = useState([]);
  const [listaActividades,      setListaActividades]      = useState([]);
  const [listaTareasPendientes, setListaTareasPendientes] = useState([]);
  const [listaEmpleados,        setListaEmpleados]        = useState([]);
  const [loading,               setLoading]               = useState(true);

  const [abrirActividad, setAbrirActividad] = useState(false);
  const [abrirProgramar, setAbrirProgramar] = useState(false);
  const [abrirAsignar,   setAbrirAsignar]   = useState(false);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [resCat, resAct, resTar, resEmp] = await Promise.all([
        CategoriaService.listar().catch(() => []),
        ActividadesService.listar().catch(() => []),
        TareaService.listar().catch(() => []),
        UsuarioService.listar().catch(() => []),
      ]);

      console.log("Actividades Service: ", resAct);
      setListaCategorias(resCat?.data       ?? resCat  ?? []);
      setListaActividades(
        (resAct?.data ?? resAct ?? [])
          .filter(a => a.proyecto?.id_proyecto === proyecto?.id_proyecto)
      );
      setListaTareasPendientes(resTar?.data ?? resTar  ?? []);
      setListaEmpleados(resEmp?.data        ?? resEmp  ?? []);
    } catch (err) {
      console.error("ActividadesView cargarDatos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarDatos(); }, [proyecto?.id_proyecto]);

  // ── Stats derivadas ───────────────────────────────────────────────────────
  const totalActividades  = listaActividades.length;
  const actRecurrentes    = listaActividades.filter(a => a.recurrencia && a.recurrencia !== "UNICA").length;
  const totalTareas       = listaTareasPendientes.length;
  const tareasFinalizadas = listaTareasPendientes.filter(t => t.estado === "FINALIZADA").length;
  const tareasPendientes  = totalTareas - tareasFinalizadas;

  const statsCards = [
    { title: "Actividades Activas",  number: totalActividades,  icon: FaClipboardCheck, detail: totalActividades  === 0 ? "Sin actividades aún"      : `${actRecurrentes} recurrentes`                                      },
    { title: "Tareas Programadas",   number: totalTareas,       icon: FaCalendarCheck,  detail: totalTareas       === 0 ? "Sin tareas programadas"    : `${tareasPendientes} pendientes`                                     },
    { title: "Procesos Finalizados", number: tareasFinalizadas, icon: FaListCheck,      detail: totalTareas       === 0 ? "Sin datos aún"             : `${Math.round((tareasFinalizadas / totalTareas) * 100)}% completado` },
    { title: "Categorías",           number: listaCategorias.length, icon: FaRotate,   detail: listaCategorias.length === 0 ? "Sin categorías"        : "Tipos de actividad"                                                 },
  ];

  const acciones = [
    { text: "Crear Actividad Base", className: "bg-indigo-600 text-white", onClick: () => setAbrirActividad(true) },
    { text: "Programar Tarea",      className: "bg-indigo-600 text-white", onClick: () => setAbrirProgramar(true) },
    { text: "Asignar Tarea",        className: "bg-indigo-600 text-white", onClick: () => setAbrirAsignar(true)   },
  ];

  const tablaContenido = loading ? (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  ) : (
    <Table
      columns={COLUMNAS_ACTIVIDADES}
      data={listaActividades}
      emptyMessage="No hay actividades registradas para este proyecto."
      onEdit={(item)   => console.log("Editar actividad:", item)}
      onDelete={(item) => console.log("Eliminar actividad:", item)}
    />
  );

  return (
    <>
      <LayoutContent
        header={{
          title:    "Actividades del Proyecto",
          subtitle: proyecto?.nombre_proy ?? "Seguimiento de tareas y actividades",
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
                      style={{ backgroundColor: "var(--card-decorator-bg)" }}
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
                    <div className="flex items-center gap-2 mt-5 text-sm" style={{ color: "var(--card-detail-text)" }}>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "var(--card-icon-wrapper-bg)", color: "var(--card-icon-wrapper-text)" }}
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

      <CrearActividad
        isOpen={abrirActividad}
        onClose={() => setAbrirActividad(false)}
        categorias={listaCategorias}
        actualizarLista={cargarDatos}
      />
      <ProgramarTarea
        isOpen={abrirProgramar}
        onClose={() => setAbrirProgramar(false)}
        actividades={listaActividades}
        actualizarLista={cargarDatos}
      />
      <AsignarTarea
        isOpen={abrirAsignar}
        onClose={() => setAbrirAsignar(false)}
        tareasPendientes={listaTareasPendientes}
        empleados={listaEmpleados}
        actualizarLista={cargarDatos}
      />
    </>
  );
}
