// pages/admin/CategoriasView.jsx
import { useState, useEffect }  from "react";
import LayoutContent            from "../../layouts/LayoutContent";
import { Card }                 from "../../components/Card";
import { Table }                from "../../components/Table";
import { ListToolbar }          from "../../components/ListToolbar";
import NuevaCategoria           from "../../components/modals/NuevaCategoria";
import EditarCategoria          from "../../components/modals/EditarCategoria";
import ConfirmarEliminacion     from "../../components/modals/Eliminar";
import GestionarCalificaciones  from "../../components/modals/GestionarCalificaciones";
import { CategoriaService }     from "../../api/categorias.service";
import { UsuarioService }       from "../../api/usuario.service";
import { CalificacionService }  from "../../api/calificacion.service";
import { FaTags, FaStar, FaCircleCheck, FaUserGroup } from "react-icons/fa6";
import { useToast } from "../../context/ToastContext";

function construirColumnas() {
  return [
    {
      key: "nombre",
      label: "Categoría",
      icon: "fa-tag",
      render: (val) => <span className="font-semibold" style={{ color: "var(--table-row-text)" }}>{val ?? "—"}</span>,
    },
    {
      key: "descripcion",
      label: "Descripción",
      icon: "fa-align-left",
      render: (val) => <span className="text-sm" style={{ color: "var(--card-subtitle)" }}>{val || "Sin descripción"}</span>,
    },
    {
      key: "requiere_calificacion",
      label: "Calificación Requerida",
      icon: "fa-star",
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
          {val ? "Sí requiere" : "No requiere"}
        </span>
      ),
    },
    {
      key: "activo",
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

export default function CategoriasView() {
  const toast = useToast();
  const [listaCategorias, setListaCategorias] = useState([]);
  const [empleados,        setEmpleados]        = useState([]);
  const [calificaciones,   setCalificaciones]    = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [mostrarInactivas, setMostrarInactivas] = useState(false);

  const [abrirNueva,  setAbrirNueva]  = useState(false);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [categoriaAEditar,   setCategoriaAEditar]   = useState(null);
  const [abrirEliminar, setAbrirEliminar] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [abrirCalificaciones, setAbrirCalificaciones] = useState(false);
  const [categoriaCalificaciones, setCategoriaCalificaciones] = useState(null);

  // Búsqueda / filtro / orden de la lista
  const [busqueda, setBusqueda] = useState("");
  const [filtroCalificacion, setFiltroCalificacion] = useState("");
  const [ordenDescendente, setOrdenDescendente] = useState(false);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [resCat, resEmp, resCalif] = await Promise.all([
        CategoriaService.listar(mostrarInactivas).catch(() => []),
        UsuarioService.buscar({ rol: "EMPLEADO" }).catch(() => []),
        CalificacionService.listar().catch(() => []),
      ]);
      setListaCategorias(resCat?.data ?? resCat ?? []);
      setEmpleados(resEmp?.data ?? resEmp ?? []);
      setCalificaciones(resCalif?.data ?? resCalif ?? []);
    } catch (err) {
      console.error("CategoriasView cargarDatos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarDatos(); }, [mostrarInactivas]);

  async function handleReactivar(categoria) {
    try {
      await CategoriaService.reactivar(categoria.id_cat);
      toast.success("¡Categoría reactivada con éxito!");
      cargarDatos();
    } catch (error) {
      console.error("Error al reactivar la categoría:", error);
      toast.error(`No se pudo reactivar:\n\n${error.message}`);
    }
  }

  const COLUMNAS_CATEGORIAS = construirColumnas();

  // Las stats reflejan siempre solo lo activo, sin importar si "Ver Inactivas"
  // está prendido (mismo criterio aplicado en ActividadesView).
  const categoriasActivas   = listaCategorias.filter(c => c.activo);
  const totalCategorias     = categoriasActivas.length;
  const requierenCal        = categoriasActivas.filter(c => c.requiere_calificacion).length;
  const noRequierenCal      = categoriasActivas.filter(c => !c.requiere_calificacion).length;
  // Empleados DISTINTOS con al menos una calificación vigente (no la suma de
  // calificaciones: un empleado calificado en 3 categorías cuenta una sola vez).
  const empleadosCalificados = new Set(calificaciones.map(c => c.empleado?.id_usuario).filter(Boolean)).size;

  const statsCards = [
    { title: "Categorías Activas",       number: totalCategorias, icon: FaTags,       detail: totalCategorias === 0 ? "Sin categorías aún" : "Catálogo global" },
    { title: "Requieren Calificación",   number: requierenCal,    icon: FaStar,       detail: requierenCal    === 0 ? "Ninguna por ahora" : "Necesitan personal calificado" },
    { title: "No Requieren",             number: noRequierenCal,  icon: FaCircleCheck,detail: noRequierenCal  === 0 ? "Todas requieren calificación" : "Asignación libre" },
    { title: "Empleados Calificados",    number: empleadosCalificados, icon: FaUserGroup, detail: empleadosCalificados === 0 ? "Nadie calificado aún" : "Con al menos una calificación" },
  ];

  // ── Búsqueda + filtro + orden ───────────────────────────────────────────
  const categoriasFiltradas = listaCategorias
    .filter((c) => !busqueda.trim() || c.nombre?.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .filter((c) => !filtroCalificacion || String(c.requiere_calificacion) === filtroCalificacion)
    .sort((a, b) => {
      const cmp = (a.nombre ?? "").localeCompare(b.nombre ?? "");
      return ordenDescendente ? -cmp : cmp;
    });

  const barraHerramientas = (
    <ListToolbar
      searchValue={busqueda}
      onSearchChange={setBusqueda}
      searchPlaceholder="Buscar categoría por nombre..."
      filters={[
        {
          label: "Calificación",
          allLabel: "Todas",
          value: filtroCalificacion,
          onChange: setFiltroCalificacion,
          options: [
            { value: "true", label: "Sí requiere" },
            { value: "false", label: "No requiere" },
          ],
        },
      ]}
      sortLabel={ordenDescendente ? "Z → A" : "A → Z"}
      onToggleSort={() => setOrdenDescendente((v) => !v)}
    />
  );

  const acciones = [
    {
      text: mostrarInactivas ? "Ocultar Inactivas" : "Ver Inactivas",
      variant: "secondary",
      onClick: () => setMostrarInactivas(v => !v),
    },
    { text: "Nueva Categoría", className: "bg-indigo-600 text-white", onClick: () => setAbrirNueva(true) },
  ];

  const tablaContenido = loading ? (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  ) : (
    <Table
      columns={COLUMNAS_CATEGORIAS}
      data={categoriasFiltradas}
      emptyMessage={
        listaCategorias.length === 0
          ? "No hay categorías registradas."
          : "Ninguna categoría coincide con la búsqueda o el filtro aplicado."
      }
      deleteTitle="Desactivar categoría"
      extraActions={[
        {
          icon: "fa-user-check",
          title: "Gestionar personal calificado",
          show: (item) => item.requiere_calificacion,
          onClick: (categoria) => { setCategoriaCalificaciones(categoria); setAbrirCalificaciones(true); },
          hoverBg: "#ccfbf1",
          hoverText: "#0d9488",
        },
        {
          icon: "fa-rotate-left",
          title: "Reactivar categoría",
          show: (item) => !item.activo,
          onClick: handleReactivar,
          hoverBg: "#dcfce7",
          hoverText: "#16a34a",
        },
      ]}
      onEdit={(item) => {
        setCategoriaAEditar(item);
        setAbrirEditar(true);
      }}
      onDelete={(item) => {
        setCategoriaAEliminar(item);
        setAbrirEliminar(true);
      }}
    />
  );

  return (
    <>
      <LayoutContent
        header={{ title: "Gestión de Categorías", subtitle: "Catálogo global de clasificaciones para actividades" }}
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
        toolbar={barraHerramientas}
        table={tablaContenido}
      />

      {abrirNueva && (
        <NuevaCategoria
          isOpen={abrirNueva}
          onClose={() => setAbrirNueva(false)}
          actualizarLista={cargarDatos}
        />
      )}

      {abrirEditar && (
        <EditarCategoria
          isOpen={abrirEditar}
          onClose={() => { setAbrirEditar(false); setCategoriaAEditar(null); }}
          categoriaSeleccionada={categoriaAEditar}
          actualizarLista={cargarDatos}
        />
      )}

      {abrirEliminar && (
        <ConfirmarEliminacion
          isOpen={abrirEliminar}
          onClose={() => { setAbrirEliminar(false); setCategoriaAEliminar(null); }}
          tituloElemento={categoriaAEliminar?.nombre}
          idElemento={categoriaAEliminar?.id_cat}
          servicioEliminar={CategoriaService.eliminar}
          actualizarLista={cargarDatos}
        />
      )}

      {abrirCalificaciones && (
        <GestionarCalificaciones
          isOpen={abrirCalificaciones}
          onClose={() => { setAbrirCalificaciones(false); setCategoriaCalificaciones(null); }}
          categoria={categoriaCalificaciones}
          empleados={empleados}
          actualizarLista={cargarDatos}
        />
      )}
    </>
  );
}
