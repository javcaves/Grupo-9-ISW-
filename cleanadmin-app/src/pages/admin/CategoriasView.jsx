// pages/admin/CategoriasView.jsx
import { useState, useEffect }  from "react";
import LayoutContent            from "../../layouts/LayoutContent";
import { Table }                from "../../components/Table";
import NuevaCategoria           from "../../components/modals/NuevaCategoria";
import EditarCategoria          from "../../components/modals/EditarCategoria";
import ConfirmarEliminacion     from "../../components/modals/Eliminar";
import GestionarCalificaciones  from "../../components/modals/GestionarCalificaciones";
import { CategoriaService }     from "../../api/categorias.service";
import { UsuarioService }       from "../../api/usuario.service";

function construirColumnas() {
  return [
    {
      key: "nombre",
      label: "Categoría",
      icon: "fa-tag",
      render: (val) => <span className="font-semibold text-slate-700">{val ?? "—"}</span>,
    },
    {
      key: "descripcion",
      label: "Descripción",
      icon: "fa-align-left",
      render: (val) => <span className="text-sm text-gray-500">{val || "Sin descripción"}</span>,
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
  const [listaCategorias, setListaCategorias] = useState([]);
  const [empleados,        setEmpleados]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [mostrarInactivas, setMostrarInactivas] = useState(false);

  const [abrirNueva,  setAbrirNueva]  = useState(false);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [categoriaAEditar,   setCategoriaAEditar]   = useState(null);
  const [abrirEliminar, setAbrirEliminar] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [abrirCalificaciones, setAbrirCalificaciones] = useState(false);
  const [categoriaCalificaciones, setCategoriaCalificaciones] = useState(null);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [resCat, resEmp] = await Promise.all([
        CategoriaService.listar(mostrarInactivas).catch(() => []),
        UsuarioService.buscar({ rol: "EMPLEADO" }).catch(() => []),
      ]);
      setListaCategorias(resCat?.data ?? resCat ?? []);
      setEmpleados(resEmp?.data ?? resEmp ?? []);
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
      alert("¡Categoría reactivada con éxito!");
      cargarDatos();
    } catch (error) {
      console.error("Error al reactivar la categoría:", error);
      alert(`No se pudo reactivar:\n\n${error.message}`);
    }
  }

  const COLUMNAS_CATEGORIAS = construirColumnas();

  const acciones = [
    {
      text: mostrarInactivas ? "Ocultar Inactivas" : "Ver Inactivas",
      className: "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50",
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
      data={listaCategorias}
      emptyMessage="No hay categorías registradas."
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
        />
      )}
    </>
  );
}
