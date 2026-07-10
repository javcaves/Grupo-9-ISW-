// pages/admin/InventariosView.jsx
import { useState, useEffect } from "react";
import { ADMIN_CONFIG }        from "../../data/adminConfig";
import LayoutContent           from "../../layouts/LayoutContent";
import { Card }                from "../../components/Card";
import { Table }               from "../../components/Table";
import { ListToolbar }         from "../../components/ListToolbar";
import { ItemsService }        from "../../api/items.service";
import CrearItemModal          from "../../components/modals/CrearItemModal";
import SolicitudResolverModal  from "../../components/notificaciones/SolicitudResolverModal";
import {
  FaBoxesStacked,
  FaTriangleExclamation,
  FaArrowRightArrowLeft,
  FaHourglassHalf,
} from "react-icons/fa6";

const TIPOS_ITEM = ['MAQUINARIA', 'HERRAMIENTA', 'UTENSILIO', 'PRODUCTO'];

// Tabla del CATÁLOGO -- Item no tiene stock, stock_minimo, categoría ni
// un proyecto único (puede estar vinculado a varios). Solo mostramos
// atributos reales de la entidad Item.
const COLUMNAS_ITEMS = [
  {
    key:   "nombre",
    label: "Ítem",
    icon:  "fa-box",
    render: (val) => (
      <span className="font-semibold" style={{ color: "var(--table-row-text)" }}>{val ?? "—"}</span>
    ),
  },
  {
    key:   "tipo",
    label: "Tipo",
    icon:  "fa-shapes",
    render: (val) => val ?? "—",
  },
  {
    key:   "unidad_medida",
    label: "Unidad de Medida",
    icon:  "fa-ruler",
    render: (val) => val ? <span className="inline-block lowercase first-letter:uppercase">{val}</span> : "—",
  },
  {
    key:   "control",
    label: "Control",
    icon:  "fa-sliders",
    render: (val) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        val === "PRESTAMO" ? "bg-amber-50 text-amber-600" : "bg-sky-50 text-sky-600"
      }`}>
        {val ?? "—"}
      </span>
    ),
  },
  {
    key:   "activo",
    label: "Estado",
    icon:  "fa-circle",
    render: (val) => (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        val ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
      }`}>
        {val ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  { key: "actions", label: "Acciones" },
];

// Tabla de BAJO STOCK -- esta sí muestra stock, porque viene de
// ItemProyecto (el vínculo item+proyecto), agregado a través de TODOS
// los proyectos. Un mismo item puede aparecer varias veces, una por
// cada proyecto donde esté bajo su mínimo.
const COLUMNAS_BAJO_STOCK = [
  {
    key:   "nombre",
    label: "Ítem",
    icon:  "fa-box",
    render: (val) => (
      <span className="font-semibold" style={{ color: "var(--table-row-text)" }}>{val ?? "—"}</span>
    ),
  },
  {
    key:   "proyecto",
    label: "Proyecto",
    icon:  "fa-diagram-project",
    render: (val) => val?.nombre_proy ?? "Sin asignar",
  },
  {
    key:   "cantidad_actual",
    label: "Stock",
    icon:  "fa-cubes",
    render: (val, item) => (
      <span className="font-semibold text-red-500">
        {val ?? 0}
        {item.unidad_medida ? <>{" "}<span className="inline-block lowercase first-letter:uppercase">{item.unidad_medida}</span></> : ""}
        <i className="fas fa-triangle-exclamation ml-1 text-xs text-red-400" />
      </span>
    ),
  },
  {
    key:   "stock_minimo",
    label: "Stock Mínimo",
    icon:  "fa-arrow-down",
    render: (val) => val ?? "—",
  },
];

const COLUMNAS_MOVIMIENTOS = [
  {
    key:   "fecha",
    label: "Fecha",
    icon:  "fa-calendar",
    render: (val) => val ? new Date(val).toLocaleDateString("es-CL") : "—",
  },
  {
    key:   "item",
    label: "Ítem",
    icon:  "fa-box",
    render: (val) => val?.nombre ?? "—",
  },
  {
    key:   "item",
    label: "Proyecto",
    icon:  "fa-diagram-project",
    render: (val) => val?.proyecto?.nombre_proy ?? "Sin asignar",
  },
  {
    key:   "tipo",
    label: "Tipo",
    icon:  "fa-arrows-left-right",
    render: (val) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        val === "ENTRADA"
          ? "bg-green-50 text-green-600"
          : val === "SALIDA"
          ? "bg-red-50 text-red-500"
          : "bg-amber-50 text-amber-600"
      }`}>
        {val ?? "—"}
      </span>
    ),
  },
  {
    key:   "cantidad",
    label: "Cantidad",
    icon:  "fa-hashtag",
    render: (val) => val ?? "—",
  },
  {
    key:   "usuario",
    label: "Registrado por",
    icon:  "fa-user",
    render: (val) => val ? `${val.nombre} ${val.apellido}` : "—",
  },
  {
    key:   "comentario",
    label: "Comentario",
    icon:  "fa-comment",
    render: (val) => (
      <span className="text-xs line-clamp-1" style={{ color: "var(--card-subtitle)" }}>{val ?? "—"}</span>
    ),
  },
];

const COLUMNAS_SOLICITUDES = [
  {
    key:   "fecha",
    label: "Fecha",
    icon:  "fa-calendar",
    render: (val) => val ? new Date(val).toLocaleDateString("es-CL") : "—",
  },
  {
    key:   "item",
    label: "Ítem",
    icon:  "fa-box",
    render: (val, row) => val?.nombre ?? row.item_sugerido ?? "—",
  },
  {
    key:   "item",
    label: "Proyecto",
    icon:  "fa-diagram-project",
    render: (val, row) => row.proyecto?.nombre_proy ?? "Sin asignar",
  },
  {
    key:   "tipo",
    label: "Tipo",
    icon:  "fa-arrows-left-right",
    render: (val) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        val === "ENTRADA" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
      }`}>
        {val ?? "—"}
      </span>
    ),
  },
  {
    key:   "cantidad",
    label: "Cantidad",
    icon:  "fa-hashtag",
    render: (val) => val ?? "—",
  },
  {
    key:   "usuario",
    label: "Solicitado por",
    icon:  "fa-user",
    render: (val) => val ? `${val.nombre} ${val.apellido}` : "—",
  },
  {
    key:   "comentario",
    label: "Comentario",
    icon:  "fa-comment",
    render: (val) => (
      <span className="text-xs line-clamp-1" style={{ color: "var(--card-subtitle)" }}>{val ?? "—"}</span>
    ),
  },
  { key: "actions", label: "Acciones" },
];

export default function InventariosView() {
  const { content } = ADMIN_CONFIG.inventarios;

  const [items,       setItems]       = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [bajoStockGlobal, setBajoStockGlobal] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [vistaActiva, setVistaActiva] = useState("items"); // "items" | "movimientos" | "bajo-stock" | "solicitudes"

  const [modalItemAbierto, setModalItemAbierto] = useState(false);
  const [itemEditar, setItemEditar]             = useState(null);
  const [modalResolverAbierto, setModalResolverAbierto] = useState(false);
  const [idMovimientoResolver, setIdMovimientoResolver] = useState(null);

  // ── Búsqueda + filtros + orden ──────────────────────────────────
  const [busqueda, setBusqueda]                 = useState("");
  const [filtroTipo, setFiltroTipo]             = useState("");
  const [filtroProyecto, setFiltroProyecto]     = useState("");
  const [filtroEstado, setFiltroEstado]         = useState("");
  const [ordenDescendente, setOrdenDescendente] = useState(false);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [resItems, resMov, resSol, resBajo] = await Promise.all([
        ItemsService.listar().catch(() => ({ data: [] })),
        ItemsService.listarMovimientos().catch(() => ({ data: [] })),
        ItemsService.listarSolicitudesPendientes().catch(() => ({ data: [] })),
        ItemsService.listarBajoStockGlobal().catch(() => ({ data: [] })),
      ]);
      setItems(resItems?.data       ?? resItems       ?? []);
      setMovimientos(resMov?.data   ?? resMov         ?? []);
      setSolicitudes(resSol?.data   ?? resSol         ?? []);
      setBajoStockGlobal(resBajo?.data ?? resBajo     ?? []);
    } catch (err) {
      console.error("InventariosView cargarDatos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarDatos(); }, []);

  function handleAbrirResolver(solicitud) {
    setIdMovimientoResolver(solicitud.id_mov);
    setModalResolverAbierto(true);
  }

  function handleCerrarResolver() {
    setModalResolverAbierto(false);
    setIdMovimientoResolver(null);
    cargarDatos(); // refresca la tabla haya sido aprobada, rechazada o simplemente cerrada
  }

  // Elimina (soft-delete) un item del catálogo -- backend lo marca
  // activo=false, no lo borra físicamente.
  async function handleEliminarItem(item) {
    const confirmado = window.confirm(
      `¿Eliminar "${item.nombre}" del catálogo? Quedará marcado como inactivo, no se borra su historial.`
    );
    if (!confirmado) return;

    try {
      await ItemsService.eliminar(item.id_item);
      cargarDatos();
    } catch (err) {
      console.error("InventariosView handleEliminarItem:", err);
      const detalle = err?.response?.data?.errorDetails || err?.data?.errorDetails || err?.message;
      alert(detalle || "No se pudo eliminar el item, revisa la consola.");
    }
  }

  // ── Categorías ya no existen en Item -- se filtra por Tipo, que sí
  // es un atributo real del catálogo ──────────────────────────────
  const listaProyectos = Array.from(
    new Map(
      bajoStockGlobal.map((i) => i.proyecto).filter(Boolean).map((p) => [p.id_proyecto, p])
    ).values()
  );

  function coincideBusqueda(nombre) {
    return !busqueda.trim() || (nombre ?? "").toLowerCase().includes(busqueda.trim().toLowerCase());
  }

  function aplicarFiltrosItem(lista) {
    return lista
      .filter((i) => coincideBusqueda(i.nombre))
      .filter((i) => !filtroTipo || i.tipo === filtroTipo)
      .filter((i) => !filtroEstado || (filtroEstado === "activo" ? i.activo : !i.activo))
      .sort((a, b) => {
        const cmp = (a.nombre ?? "").localeCompare(b.nombre ?? "");
        return ordenDescendente ? -cmp : cmp;
      });
  }

  const itemsFiltrados = aplicarFiltrosItem(items);

  const bajoStockFiltrado = bajoStockGlobal
    .filter((i) => coincideBusqueda(i.nombre))
    .filter((i) => !filtroProyecto || i.proyecto?.id_proyecto === parseInt(filtroProyecto, 10))
    .sort((a, b) => {
      const cmp = (a.nombre ?? "").localeCompare(b.nombre ?? "");
      return ordenDescendente ? -cmp : cmp;
    });

  const movimientosFiltrados = movimientos
    .filter((m) => coincideBusqueda(m.item?.nombre))
    .filter((m) => !filtroProyecto || m.item?.proyecto?.id_proyecto === parseInt(filtroProyecto, 10))
    .sort((a, b) => {
      const cmp = (a.item?.nombre ?? "").localeCompare(b.item?.nombre ?? "");
      return ordenDescendente ? -cmp : cmp;
    });

  const solicitudesFiltradas = solicitudes
    .filter((s) => coincideBusqueda(s.item?.nombre ?? s.item_sugerido))
    .filter((s) => !filtroProyecto || s.proyecto?.id_proyecto === parseInt(filtroProyecto, 10))
    .sort((a, b) => {
      const nombreA = a.item?.nombre ?? a.item_sugerido ?? "";
      const nombreB = b.item?.nombre ?? b.item_sugerido ?? "";
      const cmp = nombreA.localeCompare(nombreB);
      return ordenDescendente ? -cmp : cmp;
    });

  // ── Selector de vista ─────────────────────────────────────────
  const totalBajoStock   = bajoStockGlobal.length;
  const totalSolicitudes = solicitudes.length;
  const vistas = [
    { key: "items",        label: "Ítems"       },
    { key: "movimientos",  label: "Movimientos" },
    { key: "bajo-stock",   label: "Bajo Stock"  },
    { key: "solicitudes",  label: "Solicitudes" },
  ];

  const barraHerramientas = (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {vistas.map((v) => (
          <button
            key={v.key}
            onClick={() => setVistaActiva(v.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              vistaActiva === v.key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {v.label}
            {v.key === "bajo-stock" && totalBajoStock > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {totalBajoStock}
              </span>
            )}
            {v.key === "solicitudes" && totalSolicitudes > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {totalSolicitudes}
              </span>
            )}
          </button>
        ))}
      </div>

      <ListToolbar
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Buscar ítem por nombre..."
        filters={
          vistaActiva === "items"
            ? [
                {
                  label: "Tipo",
                  allLabel: "Todos",
                  value: filtroTipo,
                  onChange: setFiltroTipo,
                  options: TIPOS_ITEM.map((t) => ({ value: t, label: t })),
                },
                {
                  label: "Estado",
                  allLabel: "Todos",
                  value: filtroEstado,
                  onChange: setFiltroEstado,
                  options: [
                    { value: "activo", label: "Activo" },
                    { value: "inactivo", label: "Inactivo" },
                  ],
                },
              ]
            : [
                {
                  label: "Proyecto",
                  allLabel: "Todos",
                  value: filtroProyecto,
                  onChange: setFiltroProyecto,
                  options: listaProyectos.map((p) => ({ value: String(p.id_proyecto), label: p.nombre_proy })),
                },
              ]
        }
        sortLabel={ordenDescendente ? "Z → A" : "A → Z"}
        onToggleSort={() => setOrdenDescendente((v) => !v)}
      />
    </div>
  );

  // ── Stats derivadas ───────────────────────────────────────────
  const totalItems   = items.length;
  const itemsActivos = items.filter((i) => i.activo).length;
  const totalMov      = movimientos.length;

  const statsCards = [
    {
      title:  "Ítems Registrados",
      number: totalItems,
      icon:   FaBoxesStacked,
      detail: totalItems === 0 ? "Sin ítems aún" : `${itemsActivos} activos`,
    },
    {
      title:  "Bajo Stock",
      number: totalBajoStock,
      icon:   FaTriangleExclamation,
      detail: totalBajoStock === 0 ? "Stock en orden" : "Requieren reposición",
    },
    {
      title:  "Movimientos",
      number: totalMov,
      icon:   FaArrowRightArrowLeft,
      detail: totalMov === 0 ? "Sin movimientos" : "En todos los proyectos",
    },
    {
      title:  "Solicitudes Pendientes",
      number: totalSolicitudes,
      icon:   FaHourglassHalf,
      detail: totalSolicitudes === 0 ? "Sin solicitudes" : "Esperando resolución",
    },
  ];

  // adminConfig solo trae texto/clase (estático); el onClick real se
  // conecta acá, sin modificar la config compartida por las otras vistas.
  const acciones = content.actions.map((accion) => {
    if (accion.text === 'Añadir Item') {
      return { ...accion, onClick: () => setModalItemAbierto(true) };
    }
    return accion;
  });

  const tablaContenido = loading ? (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  ) : (
    <>
      {vistaActiva === "items" && (
        <Table
          columns={COLUMNAS_ITEMS}
          data={itemsFiltrados}
          emptyMessage={
            items.length === 0
              ? "No hay ítems registrados en el sistema."
              : "Ningún ítem coincide con la búsqueda o el filtro aplicado."
          }
          onEdit={(item)   => setItemEditar(item)}
          onDelete={handleEliminarItem}
        />
      )}

      {vistaActiva === "movimientos" && (
        <Table
          columns={COLUMNAS_MOVIMIENTOS}
          data={movimientosFiltrados}
          emptyMessage={
            movimientos.length === 0
              ? "No hay movimientos registrados."
              : "Ningún movimiento coincide con la búsqueda aplicada."
          }
        />
      )}

      {vistaActiva === "bajo-stock" && (
        <Table
          columns={COLUMNAS_BAJO_STOCK}
          data={bajoStockFiltrado}
          emptyMessage={
            bajoStockGlobal.length === 0
              ? "No hay ítems bajo stock mínimo en ningún proyecto. ✓"
              : "Ningún ítem coincide con la búsqueda o el filtro aplicado."
          }
        />
      )}

      {vistaActiva === "solicitudes" && (
        <Table
          columns={COLUMNAS_SOLICITUDES}
          data={solicitudesFiltradas}
          emptyMessage={
            solicitudes.length === 0
              ? "No hay solicitudes pendientes. ✓"
              : "Ninguna solicitud coincide con la búsqueda aplicada."
          }
          extraActions={[
            {
              icon: "fa-gavel",
              title: "Resolver solicitud",
              onClick: handleAbrirResolver,
              hoverBg: "#e0e7ff",
              hoverText: "#4f46e5",
            },
          ]}
        />
      )}
    </>
  );

  return (
    <>
      <LayoutContent
        header={{ title: content.title, subtitle: content.subtitle }}
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

      <CrearItemModal
        isOpen={modalItemAbierto}
        onClose={() => setModalItemAbierto(false)}
        actualizarLista={cargarDatos}
      />

      <CrearItemModal
        isOpen={!!itemEditar}
        onClose={() => setItemEditar(null)}
        modo="editar"
        item={itemEditar}
        actualizarLista={cargarDatos}
      />

      <SolicitudResolverModal
        isOpen={modalResolverAbierto}
        idMovimiento={idMovimientoResolver}
        onClose={handleCerrarResolver}
      />
    </>
  );
}
