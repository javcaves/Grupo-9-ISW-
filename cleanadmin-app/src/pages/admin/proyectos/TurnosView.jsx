// pages/admin/proyectos/TurnosView.jsx
import { useState, useEffect }  from "react";
import LayoutContent            from "../../../layouts/LayoutContent";
import { Card }                 from "../../../components/Card";
import { Modal }                from "../../../components/Modal";
import { TurnoCard }            from "../../../layouts/turnoCard";
import { FormularioTurno }      from "../../../layouts/form_turno";
import { TurnoService }         from "../../../api/turno.service";
import { FaClock, FaUserClock, FaCircleCheck } from "react-icons/fa6";

export default function TurnosView({ proyecto }) {
  const [turnos,      setTurnos]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modalCrear,  setModalCrear]  = useState(false);
  const [turnoEditar, setTurnoEditar] = useState(null);

  async function cargarDatos() {
    if (!proyecto?.id_proyecto) return;
    setLoading(true);
    try {
      const res = await TurnoService.listarPorProyecto(proyecto.id_proyecto);
      setTurnos(res?.data ?? res ?? []);
    } catch {
      setTurnos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarDatos(); }, [proyecto?.id_proyecto]);

  // ── Stats derivadas ───────────────────────────────────────────
  const totalTurnos    = turnos.length;
  const totalEmpleados = turnos.reduce((acc, t) => acc + (t.empleados?.length ?? 0), 0);
  const ingresoMinimo  = turnos.length
    ? turnos.reduce((min, t) => (t.hora_ingreso < min ? t.hora_ingreso : min), turnos[0].hora_ingreso)
    : null;
  const salidaMaxima   = turnos.length
    ? turnos.reduce((max, t) => (t.hora_salida > max ? t.hora_salida : max), turnos[0].hora_salida)
    : null;

  const statsCards = [
    {
      title:  "Turnos Configurados",
      number: totalTurnos,
      icon:   FaClock,
      detail: totalTurnos === 0 ? "Sin turnos aún" : `${totalTurnos} turno${totalTurnos !== 1 ? "s" : ""} activo${totalTurnos !== 1 ? "s" : ""}`,
    },
    {
      title:  "Personal Asignado",
      number: totalEmpleados,
      icon:   FaUserClock,
      detail: totalEmpleados === 0 ? "Sin empleados asignados" : `En ${totalTurnos} turno${totalTurnos !== 1 ? "s" : ""}`,
    },
    {
      title:  "Hora de Ingreso",
      number: ingresoMinimo ?? "—",
      icon:   FaCircleCheck,
      detail: ingresoMinimo ? "Más temprana del proyecto" : "Sin datos aún",
      isTime: true,
    },
    {
      title:  "Hora de Salida",
      number: salidaMaxima ?? "—",
      icon:   FaClock,
      detail: salidaMaxima ? "Más tardía del proyecto" : "Sin datos aún",
      isTime: true,
    },
  ];

  const acciones = [
    {
      text:      "+ Crear Turno",
      className: "bg-indigo-600 text-white",
      onClick:   () => setModalCrear(true),
    },
  ];

  const tablaContenido = loading ? (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  ) : turnos.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <i className="fas fa-clock text-4xl opacity-20 mb-3 text-slate-400" />
      <p className="text-sm text-slate-400 font-medium">No hay turnos configurados para este proyecto.</p>
      <button
        onClick={() => setModalCrear(true)}
        className="mt-4 text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors"
      >
        <i className="fas fa-plus text-xs" /> Crear el primer turno
      </button>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {turnos.map((turno) => (
        <TurnoCard
          key={turno.id_turno}
          turno={turno}
          onEdit={(t) => setTurnoEditar(t)}
        />
      ))}
    </div>
  );

  return (
    <>
      <LayoutContent
        header={{
          title:    "Gestión de Turnos",
          subtitle: proyecto?.nombre_proy ?? "Asignación horaria del personal",
        }}
        actions={acciones}
        stats={
          <>
            {statsCards.map((card, index) => {
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
                    <h2
                      className={`leading-none font-bold mt-5 ${card.isTime ? "text-[2rem]" : "text-[3rem]"}`}
                      style={{ color: "var(--card-number-text)" }}
                    >
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

      <Modal
        isOpen={modalCrear}
        onClose={() => setModalCrear(false)}
        title="Configurar Nuevo Turno"
        variant="wide"
      >
        <FormularioTurno
          idProyecto={proyecto?.id_proyecto}
          onSuccess={() => { setModalCrear(false); cargarDatos(); }}
        />
      </Modal>

      <Modal
        isOpen={!!turnoEditar}
        onClose={() => setTurnoEditar(null)}
        title="Modificar Turno"
        variant="wide"
      >
        <FormularioTurno
          idProyecto={proyecto?.id_proyecto}
          turno={turnoEditar}
          onSuccess={() => { setTurnoEditar(null); cargarDatos(); }}
        />
      </Modal>
    </>
  );
}
