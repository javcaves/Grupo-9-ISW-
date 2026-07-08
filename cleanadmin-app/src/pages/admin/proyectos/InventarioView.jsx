// pages/admin/proyectos/InventarioView.jsx
import { useState, useEffect }  from "react";
import LayoutContent            from "../../../layouts/LayoutContent";
import { Card }                 from "../../../components/Card";
import { Table }                from "../../../components/Table";
import { ItemsService }         from "../../../api/items.service";
import RegistrarMovimientoModal from "../../../components/modals/RegistrarMovimientoModal";
import CrearItemProyectoModal   from "../../../components/modals/CrearItemProyectoModal";
import { FaBoxesStacked, FaTriangleExclamation, FaArrowRightArrowLeft, FaCircleCheck } from "react-icons/fa6";

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
    key:   "categoria",
    label: "Categoría",
    icon:  "fa-tag",
    render: (val) => val?.nombre ?? val ?? "—",
  },
  {
    key:   "cantidad_actual",
    label: "Stock",
    icon:  "fa-cubes",
    render: (val, item) => {
      const bajo = item.stock_minimo != null && val <= item.stock_minimo;
      return (
        <span
          className={`font-semibold ${bajo ? "text-red-500" : ""}`}
          style={bajo ? undefined : { color: "var(--table-row-text)" }}
        >
          {val ?? 0}
          {item.unidad ? ` ${item.unidad}` : ""}
          {bajo && (
            <i className="fas fa-triangle-exclamation ml-1 text-xs text-red-400" />
          )}
        </span>
      );
    },
  },
  {
    key:   "stock_minimo",
    label: "Stock Mínimo",
    icon:  "fa-arrow-down",
    render: (val) => val ?? "—",
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

export default function InventarioView({ proyecto }) {
  const [items,       setItems]       = useState([]);
  const [bajoStock,   setBajoStock]   = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [vistaActiva, setVistaActiva] = useState("items"); // "items" | "movimientos" | "bajo-stock"
  const [modalMovimientoAbierto, setModalMovimientoAbierto] = useState(false);
  const [modalCrearItemAbierto, setModalCrearItemAbierto]   = useState(false);

  async function cargarDatos() {
    if (!proyecto?.id_proyecto) return;
    setLoading(true);
    try {
      const [resItems, resBajo, resMov] = await Promise.all([
        ItemsService.listar({ id_proyecto: proyecto.id_proyecto }).catch(() => ({ data: [] })),
        ItemsService.listarBajoStock(proyecto.id_proyecto).catch(() => ({ data: [] })),
        ItemsService.listarMovimientos({ id_proyecto: proyecto.id_proyecto }).catch(() => ({ data: [] })),
      ]);
      setItems(resItems?.data      ?? resItems      ?? []);
      setBajoStock(resBajo?.data   ?? resBajo       ?? []);
      setMovimientos(resMov?.data  ?? resMov        ?? []);
    } catch (err) {
      console.error("InventarioView cargarDatos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarDatos(); }, [proyecto?.id_proyecto]);

  // ── Stats derivadas ───────────────────────────────────────────
  const totalItems     = items.length;
  const itemsActivos   = items.filter((i) => i.activo).length;
  const bajosStock     = bajoStock.length;
  const totalMov       = movimientos.length;

  const statsCards = [
    {
      title:  "Ítems Registrados",
      number: totalItems,
      icon:   FaBoxesStacked,
      detail: totalItems === 0 ? "Sin ítems aún" : `${itemsActivos} activos`,
    },
    {
      title:  "Bajo Stock",
      number: bajosStock,
      icon:   FaTriangleExclamation,
      detail: bajosStock === 0 ? "Stock en orden" : "Requieren reposición",
    },
    {
      title:  "Movimientos",
      number: totalMov,
      icon:   FaArrowRightArrowLeft,
      detail: totalMov === 0 ? "Sin movimientos" : "Entradas y salidas",
    },
    {
      title:  "Ítems Activos",
      number: itemsActivos,
      icon:   FaCircleCheck,
      detail: totalItems === 0 ? "Sin datos aún"
        : `${Math.round((itemsActivos / totalItems) * 100)}% del total`,
    },
  ];

  const acciones = [
    {
      text:      "Registrar Movimiento",
      className: "bg-indigo-600 text-white",
      onClick:   () => setModalMovimientoAbierto(true),
    },
    {
      text:      "Crear Item",
      className: "bg-emerald-600 text-white",
      onClick:   () => setModalCrearItemAbierto(true),
    },
  ];

  // ── Selector de vista ─────────────────────────────────────────
  const vistas = [
    { key: "items",        label: "Ítems"         },
    { key: "movimientos",  label: "Movimientos"   },
    { key: "bajo-stock",   label: "Bajo Stock"    },
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

  const tablaContenido = loading ? (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  ) : (
    <>
      {/* Selector de vista */}
      <div className="flex gap-2 px-4 pt-4 pb-2">
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
            {v.key === "bajo-stock" && bajosStock > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {bajosStock}
              </span>
            )}
          </button>
        ))}
      </div>

      {vistaActiva === "items" && (
        <Table
          columns={COLUMNAS_ITEMS}
          data={items}
          emptyMessage="No hay ítems registrados para este proyecto."
          onEdit={(item)   => console.log("Editar ítem:", item)}
          onDelete={(item) => console.log("Eliminar ítem:", item)}
        />
      )}

      {vistaActiva === "movimientos" && (
        <Table
          columns={COLUMNAS_MOVIMIENTOS}
          data={movimientos}
          emptyMessage="No hay movimientos registrados."
        />
      )}

      {vistaActiva === "bajo-stock" && (
        <Table
          columns={COLUMNAS_ITEMS}
          data={bajoStock}
          emptyMessage="No hay ítems bajo stock mínimo. ✓"
          onEdit={(item) => console.log("Editar ítem:", item)}
        />
      )}
    </>
  );

  return (
    <>
      <LayoutContent
        header={{
          title:    "Inventario del Proyecto",
          subtitle: proyecto?.nombre_proy ?? "Stock de materiales asignados",
        }}
        actions={acciones}
        stats={
          <>
            {statsCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.title}
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

      <RegistrarMovimientoModal
        isOpen={modalMovimientoAbierto}
        onClose={() => setModalMovimientoAbierto(false)}
        proyecto={proyecto}
        items={items}
        actualizarLista={cargarDatos}
      />

      <CrearItemProyectoModal
        isOpen={modalCrearItemAbierto}
        onClose={() => setModalCrearItemAbierto(false)}
        proyecto={proyecto}
        actualizarLista={cargarDatos}
      />
    </>
  );
}
