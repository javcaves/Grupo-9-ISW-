// pages/admin/proyectos/ProyectoHome.jsx
import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, RotateCcw, ArrowRightCircle, Undo2, MoreVertical } from "lucide-react";
import { ProyectoService } from "../../../api/proyecto.service";
import { Card }            from "../../../components/Card";
import LayoutContent       from "../../../layouts/LayoutContent";
import { ListToolbar }     from "../../../components/ListToolbar";
import ProyectoFormModal   from "../../../components/modals/ProyectoFormModal";
import ConfirmDeleteProyectoModal from "../../../components/modals/ConfirmDeleteProyectoModal";
import CambiarFaseProyectoModal from "../../../components/modals/CambiarFaseProyectoModal";

const ESTADO_BADGE = {
  EN_PREPARACION: { label: "En Preparación", cls: "bg-amber-100 text-amber-700" },
  EN_CURSO:       { label: "En Curso",        cls: "bg-green-100 text-green-700" },
  FINALIZADO:     { label: "Finalizado",      cls: "bg-blue-100  text-blue-700"  },
};

const ESTADOS_FILTRO = [
  { value: "EN_PREPARACION", label: "En Preparación" },
  { value: "EN_CURSO",       label: "En Curso" },
  { value: "FINALIZADO",     label: "Finalizado" },
];

// Orden del flujo de fases. Desactivar NO es una fase más (es el flag
// `activo`, ya manejado por ConfirmDeleteProyectoModal/handleReactivar);
// por eso este arreglo solo cubre los 3 estados de `estado`.
const ORDEN_FASES = ["EN_PREPARACION", "EN_CURSO", "FINALIZADO"];

function faseSiguiente(estado) {
  const i = ORDEN_FASES.indexOf(estado);
  return i >= 0 && i < ORDEN_FASES.length - 1 ? ORDEN_FASES[i + 1] : null;
}

function faseAnterior(estado) {
  const i = ORDEN_FASES.indexOf(estado);
  return i > 0 ? ORDEN_FASES[i - 1] : null;
}

export default function ProyectoHome({ rol, onSeleccionarProyecto }) {
  const [proyectos, setProyectos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [proyectoEditar, setProyectoEditar]       = useState(null);
  const [proyectoEliminar, setProyectoEliminar]   = useState(null);
  const [reactivandoId, setReactivandoId]         = useState(null);
  const [cambioFase, setCambioFase]               = useState(null); // { proyecto, nuevoEstado, direccion }
  const [menuAbiertoId, setMenuAbiertoId]         = useState(null);

  // ── Filtros ──────────────────────────────────────────────────────────
  const [busqueda, setBusqueda]           = useState("");
  const [filtroEstado, setFiltroEstado]   = useState("");
  const [fechaDesde, setFechaDesde]       = useState("");
  const [fechaHasta, setFechaHasta]       = useState("");
  const [ordenDescendente, setOrdenDescendente] = useState(false);
  // Solo el admin puede ver inactivos y reactivarlos.
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const esAdmin = ["ROOT", "ADMIN"].includes(rol);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const res = esAdmin
        ? await ProyectoService.listarTodos({ incluirInactivos: mostrarInactivos })
        : await ProyectoService.listar();
      setProyectos(Array.isArray(res) ? res : (res?.data ?? []));
      setError(null);
    } catch (err) {
      console.error("ProyectoHome:", err);
      setError("No se pudieron cargar los proyectos.");
    } finally {
      setLoading(false);
    }
  }, [rol, esAdmin, mostrarInactivos]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    function handleClickFuera(e) {
      if (!e.target.closest("[data-menu-proyecto]")) {
        setMenuAbiertoId(null);
      }
    }
    document.addEventListener("click", handleClickFuera);
    return () => document.removeEventListener("click", handleClickFuera);
  }, []);

  async function handleReactivar(proyecto) {
    setReactivandoId(proyecto.id_proyecto);
    try {
      await ProyectoService.reactivar(proyecto.id_proyecto);
      await cargar();
    } catch (err) {
      alert(err?.message || "No se pudo reactivar el proyecto.");
    } finally {
      setReactivandoId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-sm text-red-500">{error}</div>;
  }

  // ── Búsqueda + filtro por estado + filtro por fecha + orden ────────────
  const aplicarFiltros = (lista) =>
    lista
      .filter((p) => !busqueda.trim() || p.nombre_proy?.toLowerCase().includes(busqueda.trim().toLowerCase()))
      .filter((p) => !filtroEstado || p.estado === filtroEstado)
      .filter((p) => !fechaDesde || (p.fecha_inicio && String(p.fecha_inicio).slice(0, 10) >= fechaDesde))
      .filter((p) => !fechaHasta || (p.fecha_inicio && String(p.fecha_inicio).slice(0, 10) <= fechaHasta))
      .sort((a, b) => {
        const cmp = (a.nombre_proy ?? "").localeCompare(b.nombre_proy ?? "");
        return ordenDescendente ? -cmp : cmp;
      });

  const proyectosActivos   = aplicarFiltros(proyectos.filter((p) => p.activo));
  const proyectosInactivos = aplicarFiltros(proyectos.filter((p) => !p.activo));

  const acciones = esAdmin
    ? [
        {
          text:      mostrarInactivos ? "Ocultar Inactivos" : "Ver Inactivos",
          variant:   "secondary",
          onClick:   () => setMostrarInactivos((v) => !v),
        },
        {
          text:      "+ Nuevo Proyecto",
          className: "bg-indigo-600 text-white",
          onClick:   () => setModalCrearAbierto(true),
        },
      ]
    : [];

  const barraHerramientas = (
    <ListToolbar
      searchValue={busqueda}
      onSearchChange={setBusqueda}
      searchPlaceholder="Buscar proyecto por nombre..."
      filters={[
        {
          label: "Estado",
          allLabel: "Todos",
          value: filtroEstado,
          onChange: setFiltroEstado,
          options: ESTADOS_FILTRO,
        },
      ]}
      sortLabel={ordenDescendente ? "Z → A" : "A → Z"}
      onToggleSort={() => setOrdenDescendente((v) => !v)}
    />
  );

  function renderTarjeta(proyecto) {
    const badge = ESTADO_BADGE[proyecto.estado] ?? { label: proyecto.estado, cls: "bg-gray-100 text-gray-500" };
    const cantidadEmpleados = proyecto.cantidad_empleados ?? 0;
    const supervisores = proyecto.supervisores ?? [];
    const inactivo = !proyecto.activo;
    const siguiente = faseSiguiente(proyecto.estado);
    const anterior = faseAnterior(proyecto.estado);
    const menuAbierto = menuAbiertoId === proyecto.id_proyecto;

    return (
      <Card
        key={proyecto.id_proyecto}
        hoverable={!inactivo}
        className={`rounded-[28px] overflow-hidden relative min-h-[170px] ${inactivo ? "opacity-60" : ""}`}
        decorator={
          <div
            className="absolute top-[-20px] right-[-20px] w-[110px] h-[110px] rounded-full"
            style={{ backgroundColor: "var(--card-decorator-bg)" }}
          />
        }
        onClick={inactivo ? undefined : () => onSeleccionarProyecto(proyecto)}
      >
        <div className="relative z-10 flex flex-col h-full">
          {/* ── Encabezado: ícono + badges + menú de acciones ── */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
            >
              <i className="fas fa-building text-sm" />
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
              {badge.label}
            </span>
            {inactivo && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                Inactivo
              </span>
            )}

            {esAdmin && (
              <div className="ml-auto relative" data-menu-proyecto>
                {inactivo ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReactivar(proyecto);
                    }}
                    disabled={reactivandoId === proyecto.id_proyecto}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                    title="Reactivar proyecto"
                  >
                    <RotateCcw size={15} className={reactivandoId === proyecto.id_proyecto ? "animate-spin" : ""} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuAbiertoId(menuAbierto ? null : proyecto.id_proyecto);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      title="Más acciones"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {menuAbierto && (
                      <div
                        className="absolute right-0 top-9 z-20 w-40 rounded-xl border shadow-lg py-1 text-sm"
                        style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setMenuAbiertoId(null);
                            setProyectoEditar(proyecto);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                          style={{ color: "var(--card-title)" }}
                        >
                          <Pencil size={13} /> Editar
                        </button>
                        <button
                          onClick={() => {
                            setMenuAbiertoId(null);
                            setProyectoEliminar(proyecto);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} /> {proyecto.estado === "FINALIZADO" ? "Desactivar" : "Eliminar"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <span style={{ color: "var(--card-label-text)" }} className="font-semibold text-[1rem] truncate">
            {proyecto.nombre_proy}
          </span>

          <h2 className="text-[1.6rem] leading-tight font-bold mt-2" style={{ color: "var(--card-number-text)" }}>
            {cantidadEmpleados}
            <span className="text-sm font-normal opacity-50 ml-1">
              empleado{cantidadEmpleados !== 1 ? "s" : ""}
            </span>
          </h2>

          {/* ── Progreso de fase (solo proyectos activos) ── */}
          {!inactivo && <FaseStepper estadoActual={proyecto.estado} />}

          {/* ── Acción principal: avanzar / anular / desactivar ── */}
          {esAdmin && !inactivo && (
            <div className="flex items-center gap-2 mt-1 mb-1" onClick={(e) => e.stopPropagation()}>
              {siguiente ? (
                <button
                  style={{ background: 'var(--button-bg)', color: 'var(--button-text)' }}
                  onClick={() => setCambioFase({ proyecto, nuevoEstado: siguiente, direccion: "avanzar" })}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-transform hover:scale-[1.02]"
                >
                  Avanzar a {ESTADO_BADGE[siguiente]?.label}
                  <ArrowRightCircle size={14} />
                </button>
              ) : (
                <button
                  onClick={() => setProyectoEliminar(proyecto)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Desactivar proyecto
                  <Trash2 size={14} />
                </button>
              )}

              {anterior && (
                <button
                  onClick={() => setCambioFase({ proyecto, nuevoEstado: anterior, direccion: "retroceder" })}
                  title={`Anular avance (volver a ${ESTADO_BADGE[anterior]?.label})`}
                  className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <Undo2 size={15} />
                </button>
              )}
            </div>
          )}

          {supervisores.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {supervisores.map((s) => (
                <span
                  key={s.id_usuario}
                  className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full"
                  title={`${s.nombre} ${s.apellido ?? ""} — ${s.proyectos_asignados} proyecto(s) activo(s)`}
                >
                  {s.nombre} · {s.proyectos_asignados}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--card-detail-text)" }}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--card-icon-wrapper-bg)", color: "var(--card-icon-wrapper-text)" }}
              >
                <i className="fas fa-location-dot text-xs" />
              </div>
              <span className="truncate max-w-[120px]">{proyecto.ubicacion ?? "Sin ubicación"}</span>
            </div>
            {!inactivo && <i className="fas fa-chevron-right opacity-30 text-sm" />}
          </div>
        </div>
      </Card>
    );
  }

  const totalFiltrado = proyectosActivos.length + (mostrarInactivos ? proyectosInactivos.length : 0);

  const contenido = totalFiltrado === 0 ? (
    <div className="col-span-full text-center py-16 text-sm text-gray-400">
      <i className="fas fa-folder-open text-3xl mb-3 block opacity-30" />
      {proyectos.length === 0
        ? "No hay proyectos disponibles."
        : "Ningún proyecto coincide con los filtros aplicados."}
    </div>
  ) : (
    <>
      {proyectosActivos.map(renderTarjeta)}

      {/* Reubicados en su propia sección para no mezclarse con los activos
          y no saturar la grilla principal cuando hay muchos proyectos. */}
      {mostrarInactivos && proyectosInactivos.length > 0 && (
        <div className="col-span-full mt-4 pt-4 border-t border-dashed" style={{ borderColor: "var(--lc-border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Proyectos Inactivos ({proyectosInactivos.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {proyectosInactivos.map(renderTarjeta)}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <LayoutContent
        header={{
          title:    "Proyectos",
          subtitle: esAdmin ? "Todos los proyectos del sistema" : "Proyectos en los que participas",
        }}
        actions={acciones}
        toolbarPosition="top"
        toolbar={
          <div className="flex flex-col gap-3">
            {barraHerramientas}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Desde:</span>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-violet-400"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Hasta:</span>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-violet-400"
                />
              </div>
              {(fechaDesde || fechaHasta || filtroEstado || busqueda) && (
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda("");
                    setFiltroEstado("");
                    setFechaDesde("");
                    setFechaHasta("");
                  }}
                  className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        }
        stats={contenido}
      />

      <ProyectoFormModal
        isOpen={modalCrearAbierto}
        onClose={() => setModalCrearAbierto(false)}
        modo="crear"
        onSuccess={cargar}
      />

      <ProyectoFormModal
        isOpen={!!proyectoEditar}
        onClose={() => setProyectoEditar(null)}
        modo="editar"
        proyecto={proyectoEditar}
        onSuccess={cargar}
      />

      <ConfirmDeleteProyectoModal
        isOpen={!!proyectoEliminar}
        onClose={() => setProyectoEliminar(null)}
        proyecto={proyectoEliminar}
        onSuccess={cargar}
      />

      <CambiarFaseProyectoModal
        isOpen={!!cambioFase}
        onClose={() => setCambioFase(null)}
        proyecto={cambioFase?.proyecto}
        nuevoEstado={cambioFase?.nuevoEstado}
        direccion={cambioFase?.direccion}
        onSuccess={cargar}
      />
    </>
  );
}

// Progreso visual de la fase actual: 3 puntos conectados por una línea,
// las fases ya completadas y la línea hasta ahí se pintan en verde, la
// fase actual queda resaltada con un anillo. Puramente informativo --
// las acciones de avanzar/anular viven en los botones de abajo.
function FaseStepper({ estadoActual }) {
  const idx = ORDEN_FASES.indexOf(estadoActual);

  return (
    <div className="flex items-center gap-1.5 my-3">
      {ORDEN_FASES.map((fase, i) => {
        const completada = idx >= 0 && i < idx;
        const actual = i === idx;

        return (
          <div key={fase} className="flex items-center flex-1 last:flex-none">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                completada
                  ? "bg-emerald-500"
                  : actual
                    ? "bg-indigo-600 ring-4 ring-indigo-100"
                    : "bg-gray-200"
              }`}
              title={ESTADO_BADGE[fase]?.label}
            />
            {i < ORDEN_FASES.length - 1 && (
              <span
                className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${
                  completada ? "bg-emerald-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
