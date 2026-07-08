// pages/admin/PersonalView.jsx
import { useState, useEffect } from "react";
import { ADMIN_CONFIG }        from "../../data/adminConfig";
import LayoutContent           from "../../layouts/LayoutContent";
import { Table }               from "../../components/Table";
import { Card }                from "../../components/Card";
import { UsuarioService }      from "../../api/usuario.service";
import ConfirmarEliminacion    from "../../components/modals/Eliminar";
import HojaDeVida              from "../../components/modals/HojaDeVida";
import { FaUsers, FaUserShield, FaUserCheck, FaUserXmark } from "react-icons/fa6";

function construirColumnasPersonal() {
  return [
    {
      key:   "nombre",
      label: "Nombre",
      icon:  "fa-user",
      render: (_, u) => (
        <span className="font-semibold" style={{ color: "var(--table-row-text)" }}>
          {u.nombre} {u.apellido}
        </span>
      ),
    },
    { key: "rut", label: "RUT", icon: "fa-id-card" },
    { key: "email", label: "Email", icon: "fa-envelope" },
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
}

export default function PersonalView() {
  const { content } = ADMIN_CONFIG.personal;

  const [usuarios, setUsuarios] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const [abrirHojaDeVida, setAbrirHojaDeVida]           = useState(false);
  const [empleadoHojaDeVida, setEmpleadoHojaDeVida]     = useState(null);

  // Desactivar (baja lógica del usuario en todo el sistema, no solo de un proyecto)
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [usuarioADesactivar, setUsuarioADesactivar]     = useState(null);

  const COLUMNAS_PERSONAL = construirColumnasPersonal();

  async function cargarDatos() {
    setLoading(true);
    try {
      const data = await UsuarioService.listar();
      const lista = data?.data ?? data ?? [];
      setUsuarios(lista.filter((u) => u.rol !== "ROOT"));
    } catch {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarDatos(); }, []);

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
      detail: supervisores === 0 ? "Sin supervisores" : "En el sistema",
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
      emptyMessage="No hay personal registrado en el sistema."
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
      onEdit={(item)   => console.log("Editar usuario:", item)}
      onDelete={(item) => {
        setUsuarioADesactivar(item);
        setModalEliminarAbierto(true);
      }}
    />
  );

  return (
    <>
      <LayoutContent
        header={{ title: content.title, subtitle: content.subtitle }}
        actions={content.actions}
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
          onClose={() => { setModalEliminarAbierto(false); setUsuarioADesactivar(null); }}
          tituloElemento={`${usuarioADesactivar?.nombre ?? ""} ${usuarioADesactivar?.apellido ?? ""}`.trim()}
          idElemento={usuarioADesactivar?.id_usuario}
          servicioEliminar={UsuarioService.eliminar}
          actualizarLista={cargarDatos}
          mensajeConfirmacion="Esta acción lo eliminará del sistema por completo, en todos los proyectos."
        />
      )}
    </>
  );
}

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
