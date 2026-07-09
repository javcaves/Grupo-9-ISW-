// pages/admin/proyectos/RegistroPersonalView.jsx
import { useState, useEffect } from "react";
import LayoutContent from "../../../layouts/LayoutContent";
import ActividadesView from "./ActividadesView";
import TareasView from "./TareasView";
import InventarioView from "./InventarioView";
import TurnosView from "./TurnosView";
import { Table } from "../../../components/Table";
import { Card } from "../../../components/Card";
import { ProyectoUsuarioService } from "../../../api/proyecto_usuario.service";
import NuevoPersonalModal from "../../../components/modals/NuevoPersonalModal";
import VincularPersonalModal from "../../../components/modals/VincularPersonalModal";
import HojaDeVida from "../../../components/modals/HojaDeVida";
import ConfirmarEliminacion from "../../../components/modals/Eliminar";
import { FaUsers, FaUserShield, FaUserCheck, FaUserXmark } from "react-icons/fa6";

const TABS = [
  { key: "personal", label: "Registro Personal" },
  { key: "actividades", label: "Actividades" },
  { key: "tareas", label: "Tareas" },
  { key: "inventario", label: "Inventario" },
  { key: "turnos", label: "Turno" },
  { key: "historial_asistencia", label: "Asistencias" },
];

export default function RegistroPersonalView({ proyecto, onVolver, rolEjecutor }) {
  const [tabActiva, setTab] = useState("personal");

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--tab-inactive-text)] opacity-60 mb-0.5">
          Gestor de Proyectos
        </p>
        <h2 className="text-xl font-bold text-[var(--tab-active-text)] leading-tight">
          {proyecto?.nombre_proy ?? "Proyecto"}
        </h2>
        {proyecto?.ubicacion && (
          <p className="text-sm text-[var(--tab-inactive-text)] opacity-70 mt-0.5">
            <i className="fas fa-map-marker-alt mr-1 opacity-50" />
            {proyecto.ubicacion}
          </p>
        )}
      </div>

      <div className="flex items-center gap-[14px] flex-wrap mb-6">
        {onVolver && (
          <button
            onClick={onVolver}
            className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors cursor-pointer mr-2"
          >
            <i className="fas fa-arrow-left" /> Proyectos
          </button>
        )}

        {TABS.map((tab) => {
          const isActive = tabActiva === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className={`
                relative min-w-[170px] h-[56px] flex items-center justify-center
                px-[20px] rounded-[18px] font-medium text-sm cursor-pointer
                transition-all duration-300 border overflow-hidden
                ${isActive
                  ? `bg-gradient-to-br from-[rgba(var(--tab-active-from),0.15)] to-[rgba(var(--tab-active-to),0.10)]
                     border-[rgba(var(--tab-active-border),0.3)]
                     text-[var(--tab-active-text)]
                     shadow-[0_10px_24px_var(--tab-active-shadow)]
                     scale-[1.03]`
                  : `text-[var(--tab-inactive-text)]
                     shadow-[0_6px_18px_var(--tab-inactive-shadow)]
                     hover:scale-[1.05]
                     hover:text-[var(--tab-hover-text)]
                     hover:shadow-[0_10px_24px_var(--tab-hover-shadow)]`
                }
              `}
              style={{
                background: !isActive ? "var(--bg-card)" : undefined,
                borderColor: !isActive ? "var(--border-color)" : undefined,
              }}
            >
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {tabActiva === "personal" && <PersonalTab proyecto={proyecto} rolEjecutor={rolEjecutor} />}
      {tabActiva === "actividades" && <ActividadesView proyecto={proyecto} />}
      {tabActiva === "tareas" && <TareasView proyecto={proyecto} />}
      {tabActiva === "inventario" && <InventarioView proyecto={proyecto} />}
      {tabActiva === "turnos" && <TurnosView proyecto={proyecto} />}
      {tabActiva === "historial_asistencia" && <AsistenciaHistorialView proyecto={proyecto} />}
    </>
  );
}

function construirColumnasPersonal() {
  return [
    {
      key: "nombre",
      label: "Nombre",
      icon: "fa-user",
      render: (_, u) => (
        <span className="font-semibold" style={{ color: "var(--table-row-text)" }}>
          {u.nombre} {u.apellido}
        </span>
      ),
    },
    { key: "rut", label: "RUT", icon: "fa-id-card" },
    { key: "email", label: "Email", icon: "fa-envelope" },
    {
      key: "rol",
      label: "Rol",
      icon: "fa-tag",
      render: (val) => <RolBadge rol={val} />,
    },
    {
      key: "activo",
      label: "Estado",
      icon: "fa-circle",
      render: (val) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${val ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            }`}
        >
          {val ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    { key: "actions", label: "Acciones" },
  ];
}

function PersonalTab({ proyecto, rolEjecutor }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [modalVincularAbierto, setModalVincularAbierto] = useState(false);
  const [abrirHojaDeVida, setAbrirHojaDeVida] = useState(false);
  const [empleadoHojaDeVida, setEmpleadoHojaDeVida] = useState(null);

  // Desvincular (no elimina al usuario del sistema, solo lo saca de este proyecto)
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [usuarioADesvincular, setUsuarioADesvincular] = useState(null);

  const COLUMNAS_PERSONAL = construirColumnasPersonal();

  const getEstadoPersonal = () => {
    const currentCount = usuarios.length;
    const min = proyecto?.min_emp || 0;
    const max = proyecto?.max_emp || 0;

    if (currentCount < min) {
      return {
        type: 'warning',
        message: `Faltan ${min - currentCount} empleado(s) para alcanzar el minimo requerido (${min})`,
        color: 'bg-amber-50 border-amber-200 text-amber-700',
        icon: 'fa-exclamation-triangle'
      };
    } else if (currentCount > max) {
      return {
        type: 'warning',
        message: `Se excedió el máximo requerido (${max}), tienes ${max - currentCount} empleado(s) de sobra`,
        color: 'bg-red-50 border-red-200 text-red-700',
        icon: 'fa-times-circle'
      };
    } else {
      return {
        type: 'success',
        message: `Personal dentro del rango establecido`,
        color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        icon: 'fa-check-circle'
      };
    }
  };

  async function cargarDatos() {
    if (!proyecto?.id_proyecto) return;
    setLoading(true);
    try {
      const data = await ProyectoUsuarioService.listarUsuarios(proyecto.id_proyecto);
      setUsuarios(data?.data ?? data ?? []);
    } catch {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarDatos(); }, [proyecto?.id_proyecto]);

  const totalPersonal = usuarios.length;
  const supervisores = usuarios.filter((u) => u.rol === "SUPERVISOR").length;
  const activos = usuarios.filter((u) => u.activo).length;
  const inactivos = usuarios.filter((u) => !u.activo).length;

  const statsCards = [
    {
      title: "Personal Registrado",
      number: totalPersonal,
      icon: FaUsers,
      detail: totalPersonal === 0 ? "Sin personal aún" : `${activos} activos`,
    },
    {
      title: "Supervisores",
      number: supervisores,
      icon: FaUserShield,
      detail: supervisores === 0 ? "Sin supervisores" : "En este proyecto",
    },
    {
      title: "Personal Activo",
      number: activos,
      icon: FaUserCheck,
      detail: totalPersonal === 0 ? "Sin datos aún" : `${Math.round((activos / totalPersonal) * 100)}% del total`,
    },
    {
      title: "Usuarios Inactivos",
      number: inactivos,
      icon: FaUserXmark,
      detail: inactivos === 0 ? "Sin inactivos" : "Requieren revisión",
    },
  ];

  const acciones = [
    {
      text: "Vincular Existente",
      className: "bg-white border border-indigo-200 text-indigo-600",
      onClick: () => setModalVincularAbierto(true),
    },
    {
      text: "+ Agregar Personal",
      className: "bg-indigo-600 text-white",
      onClick: () => setModalAgregarAbierto(true),
    },
  ];

  const tablaContenido = loading ? (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  ) : (
    <Table
      columns={COLUMNAS_PERSONAL}
      data={usuarios}
      emptyMessage="No hay personal asignado a este proyecto."
      extraActions={[
        {
          icon: "fa-chart-line",
          title: "Ver hoja de vida",
          show: (u) => u.rol === "EMPLEADO",
          onClick: (u) => { setEmpleadoHojaDeVida(u); setAbrirHojaDeVida(true); },
          hoverBg: "#dbeafe",
          hoverText: "#2563eb",
        },
      ]}
      onEdit={(item) => console.log("Editar usuario:", item)}
      onDelete={(item) => {
        setUsuarioADesvincular(item);
        setModalEliminarAbierto(true);
      }}
    />
  );

  const status = getEstadoPersonal();

  return (
    <>
      {/*señal visual de personal */}
      <div className={`
          mb-6 p-4 rounded-xl border flex items-center justify-between
          ${status.color}
      `}>
        <div className="flex items-center gap-3">
          <i className={`fas ${status.icon} text-lg`}></i>
          <span className="font-medium">{status.message}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>Minimo: <strong>{proyecto?.min_emp || 0}</strong></span>
          <span>Actual: <strong className={`
              ${usuarios.length < (proyecto?.min_emp || 0) ? 'text-amber-600' : ''}
              ${usuarios.length > (proyecto?.max_emp || 0) ? 'text-red-600' : ''}
            `}> {usuarios.length}</strong></span>
          <span>Máximo: <strong>{proyecto?.max_emp || 0}</strong></span>
        </div>
      </div>

      <LayoutContent
        header={{
          title: "Registro de Personal",
          subtitle: proyecto?.nombre_proy ?? "Personal asignado al proyecto",
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

      <NuevoPersonalModal
        isOpen={modalAgregarAbierto}
        onClose={() => setModalAgregarAbierto(false)}
        idProyecto={proyecto?.id_proyecto}
        rolEjecutor={rolEjecutor}
        onSuccess={cargarDatos}
      />

      <VincularPersonalModal
        isOpen={modalVincularAbierto}
        onClose={() => setModalVincularAbierto(false)}
        idProyecto={proyecto?.id_proyecto}
        rolEjecutor={rolEjecutor}
        usuariosVinculados={usuarios}
        onSuccess={cargarDatos}
      />

      {abrirHojaDeVida && (
        <HojaDeVida
          isOpen={abrirHojaDeVida}
          onClose={() => { setAbrirHojaDeVida(false); setEmpleadoHojaDeVida(null); }}
          empleado={empleadoHojaDeVida}
        />
      )}

      {modalEliminarAbierto && (
        <ConfirmarEliminacion
          isOpen={modalEliminarAbierto}
          onClose={() => { setModalEliminarAbierto(false); setUsuarioADesvincular(null); }}
          tituloElemento={`${usuarioADesvincular?.nombre ?? ""} ${usuarioADesvincular?.apellido ?? ""}`.trim()}
          idElemento={usuarioADesvincular?.id_usuario}
          servicioEliminar={(idUsuario) => ProyectoUsuarioService.desvincularUsuario(proyecto?.id_proyecto, idUsuario)}
          actualizarLista={cargarDatos}
          mensajeConfirmacion="Esta acción solo lo desvinculará de este proyecto. Seguirá activo en el sistema y en otros proyectos."
        />
      )}
    </>
  );
}

function RolBadge({ rol }) {
  const map = {
    ROOT: { label: "Root", cls: "bg-purple-50 text-purple-700" },
    ADMIN: { label: "Admin", cls: "bg-indigo-50 text-indigo-700" },
    SUPERVISOR: { label: "Supervisor", cls: "bg-blue-50   text-blue-700" },
    ENCARGADO: { label: "Encargado", cls: "bg-amber-50  text-amber-700" },
    EMPLEADO: { label: "Empleado", cls: "bg-gray-100  text-gray-600" },
  };
  const { label, cls } = map[rol] ?? { label: rol, cls: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}
