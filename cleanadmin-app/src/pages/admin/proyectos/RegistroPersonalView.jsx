// pages/admin/proyectos/RegistroPersonalView.jsx
import { useState, useEffect } from "react";
import LayoutContent from "../../../layouts/LayoutContent";
import ActividadesView from "./ActividadesView";
import TareasView from "./TareasView";
import InventarioView from "./InventarioView";
import TurnosView from "./TurnosView";
import AsistenciaHistorialView from "./AsistenciaHistorialView";
import { Table } from "../../../components/Table";
import { Card } from "../../../components/Card";
import { ProyectoUsuarioService } from "../../../api/proyecto_usuario.service";
import NuevoPersonalModal from "../../../components/modals/NuevoPersonalModal";
import VincularPersonalModal from "../../../components/modals/VincularPersonalModal";
import HojaDeVidaModal from "../../../components/modals/HojaDeVidaModal";
import ConfirmarEliminacion from "../../../components/modals/Eliminar";
import { FaUsers, FaUserShield, FaUserCheck, FaUserXmark } from "react-icons/fa6";
import { useToast } from "../../../context/ToastContext";

const TABS = [
  { key: "personal", label: "Registro Personal" },
  { key: "actividades", label: "Actividades" },
  { key: "tareas", label: "Tareas" },
  { key: "inventario", label: "Inventario" },
  { key: "turnos", label: "Turno" },
  { key: "historial_asistencia", label: "Asistencias" },
];

// Quién puede desvincular a quién:
// - SUPERVISOR solo lo desvincula un ADMIN (o ROOT).
// - ENCARGADO lo desvincula ADMIN, ROOT o SUPERVISOR.
// - EMPLEADO (o cualquier otro rol no listado) lo puede desvincular cualquiera.
const JERARQUIA_DESVINCULACION = {
  SUPERVISOR: ["ADMIN", "ROOT"],
  ENCARGADO:  ["ADMIN", "ROOT", "SUPERVISOR"],
};

function puedeDesvincular(rolEjecutor, rolObjetivo) {
  const permitidos = JERARQUIA_DESVINCULACION[rolObjetivo];
  if (!permitidos) return true;
  return permitidos.includes(rolEjecutor);
}

export default function RegistroPersonalView({ proyecto, onVolver, rolEjecutor }) {
  const toast = useToast();
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

  const [filtroRol, setFiltroRol] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  const COLUMNAS_PERSONAL = construirColumnasPersonal();

  const getEstadoPersonal = () =>{
    const currentCount = empleadosCount;
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
  const supervisores  = usuarios.filter((u) => u.rol === "SUPERVISOR").length;
  const activos       = usuarios.filter((u) => u.activo).length;
  const inactivos     = usuarios.filter((u) => !u.activo).length;
  const empleadosCount = usuarios.filter((u) => u.rol === "EMPLEADO").length;

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
      variant: "secondary",
      onClick: () => setModalVincularAbierto(true),
    },
    {
      text: "+ Agregar Personal",
      className: "bg-indigo-600 text-white",
      onClick: () => setModalAgregarAbierto(true),
    },
  ];

  const FILTROS_ROL = [
    { key: "TODOS",      label: "Todos",      icon: "fa-users"       },
    { key: "ENCARGADO",  label: "Encargado",  icon: "fa-user-tie"    },
    { key: "SUPERVISOR", label: "Supervisor", icon: "fa-user-shield" },
    { key: "EMPLEADO",   label: "Empleado",   icon: "fa-user"        },
  ];

  const coincideBusqueda = (u) => {
    if (!busqueda.trim()) return true;
    const termino = busqueda.trim().toLowerCase();
    const nombreCompleto = `${u.nombre ?? ""} ${u.apellido ?? ""}`.toLowerCase();
    return (
      nombreCompleto.includes(termino) ||
      (u.rut ?? "").toLowerCase().includes(termino) ||
      (u.email ?? "").toLowerCase().includes(termino)
    );
  };

  const usuariosFiltrados = usuarios
    .filter((u) => filtroRol === "TODOS" || u.rol === filtroRol)
    .filter(coincideBusqueda);

  const barraBusqueda = (
    <div className="relative max-w-sm">
      <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre, RUT o email..."
        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-violet-400"
      />
    </div>
  );

  const filtroBar = (
    <div className="flex items-center gap-2 flex-wrap">
      {FILTROS_ROL.map((f) => {
        const activo = filtroRol === f.key;
        const cantidad = usuarios
          .filter((u) => f.key === "TODOS" || u.rol === f.key)
          .filter(coincideBusqueda).length;

        return (
          <button
            key={f.key}
            onClick={() => setFiltroRol(f.key)}
            className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
              activo ? "shadow-md shadow-indigo-500/20 scale-[1.03] border-transparent text-white" : "hover:scale-[1.02]"
            }`}
            style={
              activo
                ? { background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }
                : { background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--card-subtitle)" }
            }
          >
            <i className={`fas ${f.icon} text-[11px] ${activo ? "opacity-90" : "opacity-50"}`} />
            {f.label}
            <span
              className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                activo ? "bg-white/25 text-white" : "bg-black/5 text-gray-500"
              }`}
            >
              {cantidad}
            </span>
          </button>
        );
      })}
    </div>
  );

  const barraHerramientas = (
    <div className="flex flex-col gap-3">
      {barraBusqueda}
      {filtroBar}
    </div>
  );

  const tablaContenido = loading ? (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  ) : (
    <>
      <Table
        columns={COLUMNAS_PERSONAL}
        data={usuariosFiltrados}
        emptyMessage={
          usuarios.length === 0
            ? "No hay personal registrado en este proyecto."
            : "Nadie coincide con la búsqueda o el filtro aplicado."
        }
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
        onDelete={(item) => {
          if (!puedeDesvincular(rolEjecutor, item.rol)) {
            toast.error(`No tienes permisos para desvincular a un usuario con rol ${item.rol}.`);
            return;
          }
          setUsuarioADesvincular(item);
          setModalEliminarAbierto(true);
        }}
      />
    </>
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
              ${empleadosCount < (proyecto?.min_emp || 0) ? 'text-amber-600' : ''}
              ${empleadosCount > (proyecto?.max_emp || 0) ? 'text-red-600' : ''}
            `}> {empleadosCount}</strong></span>
            <span>Máximo: <strong>{proyecto?.max_emp || 0}</strong></span>
         </div>
      </div>

      <LayoutContent
        header={{
          title: "Registro de Personal",
          subtitle: proyecto?.nombre_proy ?? "Personal asignado al proyecto",
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
        <HojaDeVidaModal
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
          mensajeExito="¡Personal desvinculado del proyecto correctamente!"
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
