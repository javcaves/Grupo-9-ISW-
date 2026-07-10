// pages/admin/proyectos/ActividadesView.jsx
import { useState, useEffect }  from "react";
import LayoutContent            from "../../../layouts/LayoutContent";
import { Card }                 from "../../../components/Card";
import { Table }                from "../../../components/Table";
import { ListToolbar }          from "../../../components/ListToolbar";
import CrearActividad           from "../../../components/modals/CrearActividad";
import EditarActividad          from "../../../components/modals/EditarActividad";
import ConfirmarEliminacion     from "../../../components/modals/Eliminar";
import { CategoriaService }     from "../../../api/categorias.service";
import { ActividadesService }   from "../../../api/actividades.service";
import { FaClipboardCheck, FaListCheck, FaCalendarDay, FaRotate } from "react-icons/fa6";

const COLUMNAS_ACTIVIDADES_BASE = [
  {
    key:   "descripcion_esp",
    label: "Actividad",
    icon:  "fa-bolt",
    render: (val) => (
      <span className="font-semibold" style={{ color: "var(--table-row-text)" }}>{val ?? "—"}</span>
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
];

function construirColumnas() {
  return [
    ...COLUMNAS_ACTIVIDADES_BASE,
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
}

export default function ActividadesView({ proyecto }) {
  const [listaCategorias,  setListaCategorias]  = useState([]);
  const [listaActividades, setListaActividades] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [mostrarInactivas, setMostrarInactivas] = useState(false);

  // Controladores de Modales
  const [abrirActividad, setAbrirActividad] = useState(false);
  const [abrirEditarAct, setAbrirEditarAct] = useState(false);
  const [actividadAEditar, setActividadAEditar] = useState(null);
  const [abrirEliminarAct, setAbrirEliminarAct] = useState(false);
  const [actividadAEliminar, setActividadAEliminar] = useState(null);

  // Búsqueda / filtro / orden de la lista
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [ordenDescendente, setOrdenDescendente] = useState(false);

  async function cargarDatos() {
    setLoading(true);
    try {
      const idProy = proyecto?.id_proyecto;
      if (!idProy) return;

      const [resCat, resAct] = await Promise.all([
        CategoriaService.listar().catch(() => []),
        ActividadesService.listar(mostrarInactivas).catch(() => []),
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

  useEffect(() => { cargarDatos(); }, [proyecto?.id_proyecto, mostrarInactivas]);

  async function handleReactivar(actividad) {
    try {
      await ActividadesService.reactivar(actividad.id_act);
      alert("¡Actividad reactivada con éxito!");
      cargarDatos();
    } catch (error) {
      console.error("Error al reactivar la actividad:", error);
      alert(`No se pudo reactivar:\n\n${error.message}`);
    }
  }

  const COLUMNAS_ACTIVIDADES = construirColumnas();

  // ── Búsqueda + filtro + orden ───────────────────────────────────────────
  const actividadesFiltradas = listaActividades
    .filter((a) => !busqueda.trim() || a.descripcion_esp?.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .filter((a) => !filtroCategoria || a.categoria?.id_cat === parseInt(filtroCategoria, 10))
    .sort((a, b) => {
      const cmp = (a.descripcion_esp ?? "").localeCompare(b.descripcion_esp ?? "");
      return ordenDescendente ? -cmp : cmp;
    });

  const barraHerramientas = (
    <ListToolbar
      searchValue={busqueda}
      onSearchChange={setBusqueda}
      searchPlaceholder="Buscar actividad por nombre..."
      filters={[
        {
          label: "Categoría",
          allLabel: "Todas",
          value: filtroCategoria,
          onChange: setFiltroCategoria,
          options: listaCategorias.map((c) => ({ value: String(c.id_cat), label: c.nombre })),
        },
      ]}
      sortLabel={ordenDescendente ? "Z → A" : "A → Z"}
      onToggleSort={() => setOrdenDescendente((v) => !v)}
    />
  );

  // ── Stats derivadas ───────────────────────────────────────────────────────
  // Las stats siempre reflejan solo lo activo, sin importar si "Ver Inactivas" está
  // prendido — de lo contrario el conteo cambiaría solo por un filtro de visibilidad.
  const actividadesActivas = listaActividades.filter(a => a.activo);
  const totalActividades  = actividadesActivas.length;
  const actRecurrentes    = actividadesActivas.filter(a => a.recurrencia && a.recurrencia !== "UNICA").length;
  const actUnicas         = actividadesActivas.filter(a => a.recurrencia === "UNICA").length;
  // Categoria es un catálogo global (no pertenece a un proyecto), así que
  // "categorías de este proyecto" en realidad significa: categorías distintas
  // que efectivamente usan las actividades de este proyecto. listaCategorias
  // (el catálogo completo) se sigue usando tal cual para el filtro y los
  // selects de crear/editar actividad, donde sí corresponde poder elegir
  // cualquier categoría existente.
  const categoriasEnUso   = new Set(actividadesActivas.map(a => a.categoria?.id_cat).filter(Boolean)).size;

  const statsCards = [
    { title: "Actividades Base",  number: totalActividades,  icon: FaClipboardCheck, detail: totalActividades  === 0 ? "Sin actividades aún" : "Catálogo del proyecto" },
    { title: "Recurrentes",       number: actRecurrentes,    icon: FaRotate,         detail: actRecurrentes    === 0 ? "Sin rutinas" : "Tareas periódicas" },
    { title: "Ejecución Única",   number: actUnicas,         icon: FaCalendarDay,    detail: actUnicas         === 0 ? "Sin actividades únicas" : "Eventos puntuales" },
    { title: "Categorías en Uso", number: categoriasEnUso,   icon: FaListCheck,      detail: categoriasEnUso   === 0 ? "Sin categorías asignadas" : "Usadas en este proyecto" },
  ];

  const acciones = [
    {
      text: mostrarInactivas ? "Ocultar Inactivas" : "Ver Inactivas",
      variant: "secondary",
      onClick: () => setMostrarInactivas(v => !v),
    },
    { text: "Crear Actividad Base", className: "bg-indigo-600 text-white", onClick: () => setAbrirActividad(true) },
  ];

  const tablaContenido = loading ? (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  ) : (
    <Table
      columns={COLUMNAS_ACTIVIDADES}
      data={actividadesFiltradas}
      emptyMessage={
        listaActividades.length === 0
          ? "No hay actividades registradas para este proyecto."
          : "Ninguna actividad coincide con la búsqueda o el filtro aplicado."
      }
      deleteTitle="Desactivar actividad"
      extraActions={[
        {
          icon: "fa-rotate-left",
          title: "Reactivar actividad",
          show: (item) => !item.activo,
          onClick: handleReactivar,
          hoverBg: "#dcfce7",
          hoverText: "#16a34a",
        },
      ]}
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
        toolbar={barraHerramientas}
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