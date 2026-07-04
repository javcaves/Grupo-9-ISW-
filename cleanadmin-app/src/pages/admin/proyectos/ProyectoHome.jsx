// pages/admin/proyectos/ProyectoHome.jsx
import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ProyectoService } from "../../../api/proyecto.service";
import { Card }            from "../../../components/Card";
import LayoutContent       from "../../../layouts/LayoutContent";
import ProyectoFormModal   from "../../../components/modals/ProyectoFormModal";
import ConfirmDeleteProyectoModal from "../../../components/modals/ConfirmDeleteProyectoModal";

const ESTADO_BADGE = {
  EN_PREPARACION: { label: "En Preparación", cls: "bg-amber-100 text-amber-700" },
  EN_CURSO:       { label: "En Curso",        cls: "bg-green-100 text-green-700" },
  FINALIZADO:     { label: "Finalizado",      cls: "bg-blue-100  text-blue-700"  },
};

export default function ProyectoHome({ rol, onSeleccionarProyecto }) {
  const [proyectos, setProyectos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [proyectoEditar, setProyectoEditar]       = useState(null);
  const [proyectoEliminar, setProyectoEliminar]   = useState(null);

  const esAdmin = ["ROOT", "ADMIN"].includes(rol);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const res  = esAdmin
        ? await ProyectoService.listarTodos()
        : await ProyectoService.listar();
      setProyectos(Array.isArray(res) ? res : (res?.data ?? []));
      setError(null);
    } catch (err) {
      console.error("ProyectoHome:", err);
      setError("No se pudieron cargar los proyectos.");
    } finally {
      setLoading(false);
    }
  }, [rol]);

  useEffect(() => {
    cargar();
  }, [cargar]);

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

  const acciones = esAdmin
    ? [
        {
          text:      "+ Nuevo Proyecto",
          className: "bg-indigo-600 text-white",
          onClick:   () => setModalCrearAbierto(true),
        },
      ]
    : [];

  const tarjetas = proyectos.length === 0 ? (
    <div className="col-span-4 text-center py-16 text-sm text-gray-400">
      <i className="fas fa-folder-open text-3xl mb-3 block opacity-30" />
      No hay proyectos disponibles.
    </div>
  ) : (
    <>
      {proyectos.map((proyecto) => {
        const badge = ESTADO_BADGE[proyecto.estado] ?? { label: proyecto.estado, cls: "bg-gray-100 text-gray-500" };
        const cantidadEmpleados = proyecto.cantidad_empleados ?? 0;
        const supervisores = proyecto.supervisores ?? [];

        return (
          <Card
            key={proyecto.id_proyecto}
            hoverable
            className="rounded-[28px] overflow-hidden relative min-h-[170px]"
            decorator={
              <div
                className="absolute top-[-20px] right-[-20px] w-[110px] h-[110px] rounded-full"
                style={{ backgroundColor: "var(--card-decorator-bg)" }}
              />
            }
            onClick={() => onSeleccionarProyecto(proyecto)}
          >
            <div className="relative z-10 flex flex-col h-full">
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

                {esAdmin && (
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProyectoEditar(proyecto);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Editar proyecto"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProyectoEliminar(proyecto);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar proyecto"
                    >
                      <Trash2 size={14} />
                    </button>
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
                <i className="fas fa-chevron-right opacity-30 text-sm" />
              </div>
            </div>
          </Card>
        );
      })}
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
        stats={tarjetas}
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
    </>
  );
}