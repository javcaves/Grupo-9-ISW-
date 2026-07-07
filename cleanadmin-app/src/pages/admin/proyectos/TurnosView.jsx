// pages/admin/proyectos/TurnosView.jsx
import { useState, useEffect }  from "react";
import LayoutContent            from "../../../layouts/LayoutContent";
import { Card }                 from "../../../components/Card";
import { Modal }                from "../../../components/Modal";
import { TurnoCard }            from "../../../layouts/turnoCard";
import { FormularioTurno }      from "../../../layouts/form_turno";
import { ColacionManager }      from "../../../layouts/ColacionManager";
import { TurnoService }         from "../../../api/turno.service";
import { AsistenciaService }    from "../../../api/asistencia.service";
import QRGenerator from "../../../components/qr/QRGenerator";
import { FaClock, FaUserClock, FaCircleCheck } from "react-icons/fa6";

export default function TurnosView({ proyecto }) {
  const [turnos,      setTurnos]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modalCrear,  setModalCrear]  = useState(false);
  const [turnoEditar, setTurnoEditar] = useState(null);
  const [turnoColacionManager, setTurnoColacionManager] = useState(null);
  const [qrTurno, setQrTurno] = useState(null);
  const [qrToken, setQrToken] = useState(null);
  const [qrExp, setQrExp] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [qrEstado, setQrEstado] = useState(null);
  const [qrEmpleados, setQrEmpleados] = useState([]);
  const [cerrandoJornada, setCerrandoJornada] = useState(false);

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

  useEffect(() => {
    if (!qrTurno?.id_turno) return undefined;

    const intervalId = window.setInterval(async () => {
      try {
        const estadoActual = await AsistenciaService.obtenerMiAsistenciaActual(qrTurno.id_turno).catch(() => null);
        const codigo = estadoActual?.code;
        const registro = estadoActual?.data;

        if (codigo === "MARCA_EXISTENTE" && registro?.asistencia?.token) {
          setQrToken(registro.asistencia.token);
          setQrExp(registro.asistencia.token_expira);
          setQrEstado("Jornada ya iniciada para hoy.");
        }

        const snapshot = await AsistenciaService.obtenerActual(qrTurno.id_turno).catch(() => null);
        const empleados = snapshot?.data?.empleados ?? snapshot?.empleados ?? [];
        setQrEmpleados(empleados);
      } catch {
        setQrEmpleados([]);
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [qrTurno?.id_turno]);

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

  async function cerrarJornada() {
    if (!qrTurno?.id_turno) return;
    setCerrandoJornada(true);
    try {
      const snapshot = await AsistenciaService.obtenerActual(qrTurno.id_turno).catch(() => null);
      const idAsistencia = snapshot?.data?.asistencia?.id_asistencia ?? snapshot?.asistencia?.id_asistencia;
      if (!idAsistencia) throw new Error("No hay una jornada abierta para cerrar.");

      await AsistenciaService.finalizar(idAsistencia);
      setQrEstado("Jornada cerrada correctamente.");
      setQrToken(null);
      setQrExp(null);
      setQrEmpleados([]);
    } catch (err) {
      setQrError(err?.message || "No se pudo cerrar la jornada.");
    } finally {
      setCerrandoJornada(false);
    }
  }

  async function generarQrAsistencia(turno) {
    setQrTurno(turno);
    setQrToken(null);
    setQrExp(null);
    setQrError(null);
    setQrEstado(null);
    setQrEmpleados([]);
    setQrLoading(true);

    try {
      const estadoActual = await AsistenciaService.obtenerMiAsistenciaActual(turno.id_turno).catch(() => null);
      const codigo = estadoActual?.code;
      const registro = estadoActual?.data;

      if (codigo === "MARCA_EXISTENTE" && registro?.asistencia?.token) {
        setQrToken(registro.asistencia.token);
        setQrExp(registro.asistencia.token_expira);
        setQrEstado("Jornada ya iniciada para hoy.");

        try {
          const snapshot = await AsistenciaService.obtenerActual(turno.id_turno);
          const empleados = snapshot?.data?.empleados ?? snapshot?.empleados ?? [];
          setQrEmpleados(empleados);
        } catch {
          setQrEmpleados([]);
        }
        return;
      }

      if (codigo === "MARCA_EXISTENTE") {
        setQrEstado("Ya existe una jornada abierta para hoy.");
        return;
      }

      const res = await AsistenciaService.crear({ id_turno: turno.id_turno });
      const token = res?.data?.token ?? res?.token ?? null;
      const exp = res?.data?.token_expira ?? res?.token_expira ?? null;

      if (!token) throw new Error("No se pudo obtener el token de la jornada.");

      setQrToken(token);
      setQrExp(exp);
      setQrEstado("Jornada iniciada correctamente.");

      try {
        const snapshot = await AsistenciaService.obtenerActual(turno.id_turno);
        const empleados = snapshot?.data?.empleados ?? snapshot?.empleados ?? [];
        setQrEmpleados(empleados);
      } catch {
        setQrEmpleados([]);
      }
    } catch (err) {
      setQrError(err?.message || "No se pudo generar la asistencia.");
    } finally {
      setQrLoading(false);
    }
  }

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
          onGenerarQr={(t) => generarQrAsistencia(t)}
          onManageColaciones={(t) => setTurnoColacionManager(t)}
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
        isOpen={!!qrTurno}
        onClose={() => {
          setQrTurno(null);
          setQrToken(null);
          setQrExp(null);
          setQrError(null);
        }}
        title="QR de Asistencia"
        variant="wide"
      >
        <div className="flex flex-col items-center gap-4 p-2">
          <p className="text-sm text-center text-slate-600">
            Turno: <span className="font-semibold text-slate-800">{qrTurno?.nombre}</span>
          </p>
          {qrLoading && <p className="text-sm text-slate-500">Verificando estado y generando QR...</p>}
          {qrEstado && <p className="text-sm text-violet-700">{qrEstado}</p>}
          {qrError && <p className="text-sm text-red-600">{qrError}</p>}
          {!qrLoading && !qrError && qrToken && (
            <QRGenerator token={qrToken} proyecto={proyecto?.nombre_proy} turno={qrTurno?.nombre} exp={qrExp} />
          )}
          {!qrLoading && !qrError && (
            <button
              onClick={cerrarJornada}
              disabled={cerrandoJornada}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {cerrandoJornada ? "Cerrando..." : "Cerrar jornada"}
            </button>
          )}

          {qrEmpleados.length > 0 && (
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-700">Empleados inscritos en la jornada</p>
              <div className="space-y-2">
                {qrEmpleados.map((empleado, index) => {
                  const nombre = empleado?.empleado?.nombres || empleado?.empleado?.nombre || empleado?.nombre || `Empleado ${index + 1}`;
                  const estado = (empleado?.estado || "EN_ESPERA").toUpperCase();
                  const estadoConfig = {
                    PRESENTE: { label: "Presente", bg: "bg-green-100", text: "text-green-700" },
                    ATRASO: { label: "Atraso", bg: "bg-amber-100", text: "text-amber-700" },
                    EN_ESPERA: { label: "En espera", bg: "bg-violet-100", text: "text-violet-700" },
                    RETIRADO: { label: "Retirado", bg: "bg-blue-100", text: "text-blue-700" },
                    FALTA_JUSTIFICADA: { label: "Justificado", bg: "bg-amber-100", text: "text-amber-700" },
                    FALTA_INJUSTIFICADA: { label: "Inasistencia", bg: "bg-red-100", text: "text-red-700" },
                  };
                  const cfg = estadoConfig[estado] || estadoConfig.EN_ESPERA;

                  return (
                    <div key={empleado?.id_asistencia_empleado || `${nombre}-${index}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                      <span className="font-medium text-slate-700">{nombre}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>

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

      <Modal
        isOpen={!!turnoColacionManager}
        onClose={() => setTurnoColacionManager(null)}
        title="Gestor de Horarios de Colación"
        variant="wide"
      >
        <ColacionManager
          turno={turnoColacionManager}
          onSuccess={() => { setTurnoColacionManager(null); cargarDatos(); }}
        />
      </Modal>
    </>
  );
}
