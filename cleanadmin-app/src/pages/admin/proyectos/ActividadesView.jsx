// pages/admin/proyectos/ActividadesView.jsx
import { useState, useEffect }  from "react";
import LayoutContent            from "../../../layouts/LayoutContent";
import { Card }                 from "../../../components/Card";
import { Table }                from "../../../components/Table";
import CrearActividad           from "../../../components/modals/CrearActividad";
import EditarActividad          from "../../../components/modals/EditarActividad";
import ConfirmarEliminacion     from "../../../components/modals/Eliminar";
import { CategoriaService }     from "../../../api/categorias.service";
import { ActividadesService }   from "../../../api/actividades.service";
import { FaClipboardCheck, FaListCheck, FaCalendarDay, FaRotate } from "react-icons/fa6";

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
  const [listaCategorias,  setListaCategorias]  = useState([]);
  const [listaActividades, setListaActividades] = useState([]);
  const [loading,          setLoading]          = useState(true);

  // Controladores de Modales
  const [abrirActividad, setAbrirActividad] = useState(false);
  const [abrirEditarAct, setAbrirEditarAct] = useState(false);
  const [actividadAEditar, setActividadAEditar] = useState(null);
  const [abrirEliminarAct, setAbrirEliminarAct] = useState(false);
  const [actividadAEliminar, setActividadAEliminar] = useState(null);

  async function cargarDatos() {
    setLoading(true);
    try {
      const idProy = proyecto?.id_proyecto;
      if (!idProy) return;

      const [resCat, resAct] = await Promise.all([
        CategoriaService.listar().catch(() => []),
        ActividadesService.listar().catch(() => []),
      ]);

      setListaCategorias(resCat?.data ?? resCat ?? []);

      // Filtramos exclusivamente las actividades de este proyecto
      const actividadesCrudas = resAct?.data ?? resAct ?? [];
      const actividadesFiltradas = actividadesCrudas.filter(
        a => a.proyecto?.id_proyecto === idProy
      );
      setListaActividades(actividadesFiltradas);

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
  const actUnicas         = listaActividades.filter(a => a.recurrencia === "UNICA").length;
  const totalCategorias   = listaCategorias.length;

  const statsCards = [
    { title: "Actividades Base",  number: totalActividades,  icon: FaClipboardCheck, detail: totalActividades  === 0 ? "Sin actividades aún" : "Catálogo del proyecto" },
    { title: "Recurrentes",       number: actRecurrentes,    icon: FaRotate,         detail: actRecurrentes    === 0 ? "Sin rutinas" : "Tareas periódicas" },
    { title: "Ejecución Única",   number: actUnicas,         icon: FaCalendarDay,    detail: actUnicas         === 0 ? "Sin actividades únicas" : "Eventos puntuales" },
    { title: "Categorías",        number: totalCategorias,   icon: FaListCheck,      detail: totalCategorias   === 0 ? "Sin categorías" : "Clasificaciones globales" },
  ];

  const acciones = [
    { text: "Crear Actividad Base", className: "bg-indigo-600 text-white", onClick: () => setAbrirActividad(true) },
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
      onEdit={(item) => {
        setActividadAEditar(item);
        setAbrirEditarAct(true);
      }}
      onDelete={(item) => {
        setActividadAEliminar(item);
        setAbrirEliminarAct(true);
      }}
    />
  );

  return (
    <>
      <LayoutContent
        header={{
          title:    "Catálogo de Actividades",
          subtitle: "Configuración de actividades base del proyecto",
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

      {abrirActividad && (
        <CrearActividad
          isOpen={abrirActividad}
          onClose={() => setAbrirActividad(false)}
          categorias={listaCategorias}
          actualizarLista={cargarDatos}
          idProyecto={proyecto?.id_proyecto}
        />
      )}

      {abrirEditarAct && (
        <EditarActividad
          isOpen={abrirEditarAct}
          onClose={() => {
            setAbrirEditarAct(false);
            setActividadAEditar(null);
          }}
          categorias={listaCategorias}
          actualizarLista={cargarDatos}
          actividadActual={actividadAEditar}
        />
      )}

      {abrirEliminarAct && (
        <ConfirmarEliminacion
          isOpen={abrirEliminarAct}
          onClose={() => {
            setAbrirEliminarAct(false);
            setActividadAEliminar(null);
          }}
          tituloElemento={actividadAEliminar?.descripcion_esp}
          idElemento={actividadAEliminar?.id_act}
          servicioEliminar={ActividadesService.eliminar} 
          actualizarLista={cargarDatos}
        />
      )}
    </>
  );
}