// pages/admin/proyectos/RegistroPersonalView.jsx
import { useState, useEffect }       from "react";
import LayoutContent                  from "../../../layouts/LayoutContent";
import ActividadesView                from "./ActividadesView";
import InventarioView                 from "./InventarioView";
import TurnosView                     from "./TurnosView";
import { Table }                      from "../../../components/Table";
import { Card }                       from "../../../components/Card";
import { ProyectoUsuarioService }     from "../../../api/proyecto_usuario.service";
import { FaUsers, FaUserShield, FaUserCheck, FaUserXmark } from "react-icons/fa6";

const TABS = [
  { key: "personal",    label: "Registro Personal" },
  { key: "actividades", label: "Actividades"       },
  { key: "inventario",  label: "Inventario"        },
  { key: "turnos",      label: "Turno"             },
];

export default function RegistroPersonalView({ proyecto, onVolver }) {
  const [tabActiva, setTab] = useState("personal");

  return (
    <>
      {/* Encabezado del registro */}
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

      {/* Tabs */}
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
                background:  !isActive ? "var(--bg-card)" : undefined,
                borderColor: !isActive ? "var(--border-color)" : undefined,
              }}
            >
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido del tab activo */}
      {tabActiva === "personal"    && <PersonalTab     proyecto={proyecto} />}
      {tabActiva === "actividades" && <ActividadesView proyecto={proyecto} />}
      {tabActiva === "inventario"  && <InventarioView  proyecto={proyecto} />}
      {tabActiva === "turnos"      && <TurnosView      proyecto={proyecto} />}
    </>
  );
}

/* ─────────────────────────────────────────────
   PersonalTab
───────────────────────────────────────────── */
const COLUMNAS_PERSONAL = [
  {
    key:   "nombre",
    label: "Nombre",
    icon:  "fa-user",
    render: (_, u) => (
      <span className="font-semibold text-slate-700">
        {u.nombre} {u.apellido}
      </span>
    ),
  },
  {
    key:   "rut",
    label: "RUT",
    icon:  "fa-id-card",
  },
  {
    key:   "email",
    label: "Email",
    icon:  "fa-envelope",
  },
  {
    key:   "rol",
    label: "Rol",
    icon:  "fa-tag",
    render: (val) => <RolBadge rol={val} />,
  },
  {
    key:   "activo",
    label: "Estado",
    icon:  "fa-circle",
    render: (val) => (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
          val ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
        }`}
      >
        {val ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  { key: "actions", label: "Acciones" },
];

function PersonalTab({ proyecto }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading,  setLoading]  = useState(true);

  async function cargarDatos() {
    if (!proyecto?.id_proyecto) return;
    setLoading(true);
    try {
      const data = await ProyectoUsuarioService.listarUsuarios(proyecto.id_proyecto);
      console.log("Data de ProyectoUsuarioService:", data);
      setUsuarios(data?.data ?? data ?? []);
    } catch {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarDatos(); }, [proyecto?.id_proyecto]);

  // ── Stats derivadas ───────────────────────────────────────────
  const totalPersonal = usuarios.length;
  const supervisores  = usuarios.filter((u) => u.rol === "SUPERVISOR").length;
  const activos       = usuarios.filter((u) => u.activo).length;
  const inactivos     = usuarios.filter((u) => !u.activo).length;

  const statsCards = [
    {
      title:  "Personal Registrado",
      number: totalPersonal,
      icon:   FaUsers,
      detail: totalPersonal === 0 ? "Sin personal aún" : `${activos} activos`,
    },
    {
      title:  "Supervisores",
      number: supervisores,
      icon:   FaUserShield,
      detail: supervisores === 0 ? "Sin supervisores" : "En este proyecto",
    },
    {
      title:  "Personal Activo",
      number: activos,
      icon:   FaUserCheck,
      detail: totalPersonal === 0 ? "Sin datos aún" : `${Math.round((activos / totalPersonal) * 100)}% del total`,
    },
    {
      title:  "Usuarios Inactivos",
      number: inactivos,
      icon:   FaUserXmark,
      detail: inactivos === 0 ? "Sin inactivos" : "Requieren revisión",
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
      onEdit={(item)   => console.log("Editar usuario:", item)}
      onDelete={(item) => console.log("Eliminar usuario:", item)}
    />
  );

  return (
    <LayoutContent
      header={{
        title:    "Registro de Personal",
        subtitle: proyecto?.nombre_proy ?? "Personal asignado al proyecto",
      }}
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
  );
}

/* ── Subcomponentes ──────────────────────────────────────────── */

function RolBadge({ rol }) {
  const map = {
    ROOT:       { label: "Root",       cls: "bg-purple-50 text-purple-700" },
    ADMIN:      { label: "Admin",      cls: "bg-indigo-50 text-indigo-700" },
    SUPERVISOR: { label: "Supervisor", cls: "bg-blue-50   text-blue-700"   },
    ENCARGADO:  { label: "Encargado",  cls: "bg-amber-50  text-amber-700"  },
    EMPLEADO:   { label: "Empleado",   cls: "bg-gray-100  text-gray-600"   },
  };
  const { label, cls } = map[rol] ?? { label: rol, cls: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}
