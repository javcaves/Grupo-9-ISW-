// pages/admin/ReportesView.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';

import { ADMIN_CONFIG } from '../../data/adminConfig';
import LayoutContent from '../../layouts/LayoutContent';
import { Card } from '../../components/Card';
import { DashboardService } from '../../api/dashboard.service';
import { ProyectoService } from '../../api/proyecto.service';
import { ItemsService } from '../../api/items.service';

const COLORES_ESTADO = {
  EN_PREPARACION: '#f59e0b',
  EN_CURSO: '#6366f1',
  FINALIZADO: '#10b981',
};

const COLOR_ASISTENCIA = '#6366f1';
const COLOR_TAREAS = '#10b981';
const COLOR_TAREAS_PENDIENTES = '#e2e8f0';
const COLOR_CONSUMO = '#f59e0b';
const COLOR_TURNOS_GENERADOS = '#6366f1';
const COLOR_TURNOS_COMPLETADOS = '#10b981';

const SEVERIDAD_ICONO = {
  ROJO: '🔴',
  AMARILLO: '🟡',
  VERDE: '🟢',
};

const PESTANAS = [
  { key: 'rrhh',       label: 'RRHH y Asistencia' },
  { key: 'proyectos',  label: 'Proyectos y Turnos' },
  { key: 'inventario', label: 'Inventario' },
];

export default function ReportesView() {
  const { content } = ADMIN_CONFIG.reportes;

  const [dias, setDias] = useState(30);
  const [idProyecto, setIdProyecto] = useState('');
  const [proyectos, setProyectos] = useState([]);

  const [kpis, setKpis] = useState(null);
  const [asistenciaSerie, setAsistenciaSerie] = useState([]);
  const [estadoProyectos, setEstadoProyectos] = useState([]);
  const [rendimiento, setRendimiento] = useState([]);
  const [inventario, setInventario] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [turnosPorProyecto, setTurnosPorProyecto] = useState([]);
  const [topConsumo, setTopConsumo] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pestaña activa: solo se montan los gráficos de la pestaña visible,
  // para no renderizar 8+ gráficos de golpe. En modo impresión se
  // ignora y se muestran todas las secciones (ver handleGenerarPDF).
  const [pestanaActiva, setPestanaActiva] = useState('rrhh');
  const [modoImpresion, setModoImpresion] = useState(false);

  // Lista de proyectos para el filtro y para la línea de tiempo
  // (se carga una sola vez; se asume que Proyecto trae fecha_inicio,
  // fecha_fin y estado -- ajustar los nombres de campo si difieren).
  useEffect(() => {
    ProyectoService.listarTodos()
      .then((res) => setProyectos(Array.isArray(res) ? res : (res?.data ?? [])))
      .catch((err) => console.error('Error al listar proyectos:', err));
  }, []);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);

    const filtros = {
      dias,
      ...(idProyecto ? { id_proyecto: idProyecto } : {}),
    };

    try {
      const [
        kpisRes,
        asistenciaRes,
        estadoRes,
        rendimientoRes,
        inventarioRes,
        alertasRes,
        turnosRes,
        consumoRes,
      ] = await Promise.all([
        DashboardService.obtenerKPIs(filtros),
        DashboardService.obtenerAsistenciaSerie(filtros),
        DashboardService.obtenerEstadoProyectos(filtros),
        DashboardService.obtenerRendimiento(filtros),
        DashboardService.obtenerInventario(filtros),
        DashboardService.obtenerAlertas(filtros),
        // GET /dashboard/turnos -- fallback a [] para que la sección no
        // rompa el resto del dashboard si este endpoint en particular falla.
        DashboardService.obtenerTurnosPorProyecto(filtros).catch(() => []),
        // Ya existe: GET /items/stats/consumo (top 5 histórico)
        ItemsService.estadisticasConsumo().catch(() => ({ data: [] })),
      ]);

      setKpis(kpisRes);
      setAsistenciaSerie(Array.isArray(asistenciaRes) ? asistenciaRes : []);
      setEstadoProyectos(Array.isArray(estadoRes) ? estadoRes : []);
      setRendimiento(Array.isArray(rendimientoRes) ? rendimientoRes : []);
      setInventario(inventarioRes);
      setAlertas(Array.isArray(alertasRes) ? alertasRes : []);
      setTurnosPorProyecto(Array.isArray(turnosRes) ? turnosRes : []);
      setTopConsumo(consumoRes?.data ?? consumoRes ?? []);
    } catch (err) {
      console.error('Error al cargar el dashboard:', err);
      setError(err.message || 'No se pudo cargar el dashboard.');
    } finally {
      setLoading(false);
    }
  }, [dias, idProyecto]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Cuando el navegador termina de imprimir (o cancela), volvemos a la
  // vista normal por pestañas.
  useEffect(() => {
    const salirModoImpresion = () => setModoImpresion(false);
    window.addEventListener('afterprint', salirModoImpresion);
    return () => window.removeEventListener('afterprint', salirModoImpresion);
  }, []);

  function handleGenerarPDF() {
    // Mostramos TODAS las secciones (no solo la pestaña activa) para
    // que el PDF quede completo, y esperamos un frame a que React las
    // pinte antes de abrir el diálogo de impresión.
    setModoImpresion(true);
    setTimeout(() => window.print(), 50);
  }

  const acciones = content.actions.map((accion) => {
    if (accion.text === 'Generar PDF') {
      return { ...accion, onClick: handleGenerarPDF };
    }
    return accion;
  });

  // ── Tareas cumplidas vs pendientes, derivado del KPI existente
  // (evita depender de un endpoint nuevo) ──────────────────────────
  const datosTareas = useMemo(() => {
    if (!kpis) return [];
    const cumplidas = kpis.porcentajeTareas ?? 0;
    return [
      { name: 'Cumplidas', value: cumplidas },
      { name: 'Pendientes', value: Math.max(100 - cumplidas, 0) },
    ];
  }, [kpis]);

  // ── Línea de tiempo de proyectos (a partir de ProyectoService, sin
  // endpoint nuevo) ─────────────────────────────────────────────────
  const proyectosConFechas = useMemo(
    () => proyectos.filter((p) => p.fecha_inicio && p.fecha_fin),
    [proyectos]
  );

  const rangoFechas = useMemo(() => {
    if (proyectosConFechas.length === 0) return null;
    const inicios = proyectosConFechas.map((p) => new Date(p.fecha_inicio).getTime());
    const fines = proyectosConFechas.map((p) => new Date(p.fecha_fin).getTime());
    const min = Math.min(...inicios);
    const max = Math.max(...fines);
    return { min, max, total: Math.max(max - min, 1) };
  }, [proyectosConFechas]);

  function posicionEnLinea(proyecto) {
    if (!rangoFechas) return { left: '0%', width: '0%' };
    const inicio = new Date(proyecto.fecha_inicio).getTime();
    const fin = new Date(proyecto.fecha_fin).getTime();
    const left = ((inicio - rangoFechas.min) / rangoFechas.total) * 100;
    const width = Math.max(((fin - inicio) / rangoFechas.total) * 100, 1.5);
    return { left: `${left}%`, width: `${width}%` };
  }

  const mostrarSeccion = (clave) => modoImpresion || pestanaActiva === clave;

  return (
    <>
      {/* Estilos de impresión "a prueba de balas": ocultamos TODO lo
          que hay en la página y solo volvemos a mostrar el contenedor
          del reporte. No depende de conocer las clases del Sidebar/TopBar. */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #reporte-imprimible, #reporte-imprimible * { visibility: visible; }
          #reporte-imprimible {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-imprimir { display: none !important; }
        }
      `}</style>

      <LayoutContent
        header={{ title: content.title, subtitle: content.subtitle }}
        actions={acciones}
        stats={
          kpis && (
            <>
              <KpiCard label="Proyectos" value={kpis.proyectosActivos} />
              <KpiCard label="Empleados" value={kpis.empleados} />
              <KpiCard label="Asistencia" value={`${kpis.porcentajeAsistencia}%`} />
              <KpiCard label="Tareas" value={`${kpis.porcentajeTareas}%`} />
              <KpiCard label="Stock bajo" value={kpis.stockBajo} alerta={kpis.stockBajo > 0} />
              <KpiCard label="Alertas" value={kpis.alertas} alerta={kpis.alertas > 0} />
            </>
          )
        }
      />

      <div id="reporte-imprimible">
        {/* Filtros: proyecto + periodo (no se imprimen, no aportan al PDF) */}
        <div className="no-imprimir flex flex-wrap items-center gap-3 my-6">
          <select
            value={idProyecto}
            onChange={(e) => setIdProyecto(e.target.value)}
            className="rounded-full px-4 py-2 text-sm border outline-none"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--card-title)' }}
          >
            <option value="">Todos los proyectos</option>
            {proyectos.map((p) => (
              <option key={p.id_proyecto} value={p.id_proyecto}>
                {p.nombre_proy}
              </option>
            ))}
          </select>

          <select
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className="rounded-full px-4 py-2 text-sm border outline-none"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--card-title)' }}
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>

          <div className="flex gap-2 ml-auto">
            {PESTANAS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPestanaActiva(p.key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  pestanaActiva === p.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* En modo impresión mostramos un título simple de sección para
            dar contexto ya que las pestañas no se ven en el PDF. */}
        {modoImpresion && (
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {content.title} — Reporte completo
          </h2>
        )}

        {error && <div className="text-sm text-rose-500 mb-4">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* ============ RRHH Y ASISTENCIA ============ */}
            {mostrarSeccion('rrhh') && (
              <section className="mb-8">
                {modoImpresion && <SeccionTitulo texto="RRHH y Asistencia" />}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card title="Asistencia" subtitle={`Últimos ${dias} días`}>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={asistenciaSerie}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => [`${v}%`, 'Asistencia']} />
                        <Line
                          type="monotone" dataKey="porcentaje" stroke={COLOR_ASISTENCIA}
                          strokeWidth={2} dot={false} isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card title="Tareas cumplidas" subtitle="Global, todos los proyectos filtrados">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={datosTareas}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          isAnimationActive={false}
                        >
                          <Cell fill={COLOR_TAREAS} />
                          <Cell fill={COLOR_TAREAS_PENDIENTES} />
                        </Pie>
                        <Legend />
                        <Tooltip formatter={(v) => `${Math.round(v)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                <Card title="Rendimiento por proyecto" subtitle="% asistencia y % tareas cumplidas">
                  {rendimiento.length > 0 ? (
                    <ResponsiveContainer width="100%" height={Math.max(240, rendimiento.length * 48)}>
                      <BarChart data={rendimiento} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="nombre_proy" tick={{ fontSize: 11 }} width={110} />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Legend />
                        <Bar dataKey="porcentajeAsistencia" name="Asistencia" fill={COLOR_ASISTENCIA} radius={[0, 4, 4, 0]} isAnimationActive={false} />
                        <Bar dataKey="porcentajeTareas" name="Tareas" fill={COLOR_TAREAS} radius={[0, 4, 4, 0]} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EstadoVacio texto="No hay datos de rendimiento para el período seleccionado." />
                  )}
                </Card>
              </section>
            )}

            {/* ============ PROYECTOS Y TURNOS ============ */}
            {mostrarSeccion('proyectos') && (
              <section className="mb-8">
                {modoImpresion && <SeccionTitulo texto="Proyectos y Turnos" />}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card title="Estado de proyectos" subtitle="Distribución actual">
                    {estadoProyectos.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={estadoProyectos}
                            dataKey="cantidad"
                            nameKey="estado"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            isAnimationActive={false}
                          >
                            {estadoProyectos.map((entry) => (
                              <Cell key={entry.estado} fill={COLORES_ESTADO[entry.estado] || '#94a3b8'} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <EstadoVacio texto="No hay proyectos para mostrar." />
                    )}
                  </Card>

                  <Card title="Turnos generados por proyecto" subtitle={`Últimos ${dias} días`}>
                    {turnosPorProyecto.length > 0 ? (
                      <ResponsiveContainer width="100%" height={Math.max(220, turnosPorProyecto.length * 45)}>
                        <BarChart data={turnosPorProyecto} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="nombre_proy" tick={{ fontSize: 11 }} width={110} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="turnos_generados" name="Generados" fill={COLOR_TURNOS_GENERADOS} radius={[0, 4, 4, 0]} isAnimationActive={false} />
                          <Bar dataKey="turnos_completados" name="Completados" fill={COLOR_TURNOS_COMPLETADOS} radius={[0, 4, 4, 0]} isAnimationActive={false} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EstadoVacio texto="No hay turnos generados para el período seleccionado." />
                    )}
                  </Card>
                </div>

                <Card title="Línea de tiempo de proyectos" subtitle="Fecha de inicio y término">
                  {proyectosConFechas.length > 0 ? (
                    <div className="space-y-3 py-2">
                      {proyectosConFechas.map((p) => {
                        const pos = posicionEnLinea(p);
                        return (
                          <div key={p.id_proyecto} className="flex items-center gap-3">
                            <span
                              className="w-32 shrink-0 truncate text-xs"
                              style={{ color: 'var(--card-subtitle)' }}
                              title={p.nombre_proy}
                            >
                              {p.nombre_proy}
                            </span>
                            <div
                              className="flex-1 h-5 rounded-full relative"
                              style={{ background: 'var(--bg-color)' }}
                            >
                              <div
                                className="absolute h-5 rounded-full"
                                style={{ ...pos, backgroundColor: COLORES_ESTADO[p.estado] || '#94a3b8' }}
                                title={`${p.fecha_inicio} → ${p.fecha_fin}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex gap-4 pt-2 text-xs" style={{ color: 'var(--card-subtitle)' }}>
                        {Object.entries(COLORES_ESTADO).map(([estado, color]) => (
                          <span key={estado} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                            {estado.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EstadoVacio texto="Ningún proyecto tiene fecha de inicio/término definida todavía." />
                  )}
                </Card>
              </section>
            )}

            {/* ============ INVENTARIO ============ */}
            {mostrarSeccion('inventario') && (
              <section className="mb-8">
                {modoImpresion && <SeccionTitulo texto="Inventario" />}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card title="Inventario" subtitle="Stock crítico y solicitudes">
                    {inventario ? (
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--card-subtitle)' }}>Solicitudes pendientes</span>
                          <span className="font-semibold" style={{ color: 'var(--card-title)' }}>
                            {inventario.solicitudesPendientes}
                          </span>
                        </div>

                        <div>
                          <p className="mb-2 font-medium" style={{ color: 'var(--card-title)' }}>
                            Stock crítico ({inventario.stockCritico.length})
                          </p>
                          <ul className="space-y-1 max-h-32 overflow-auto">
                            {inventario.stockCritico.map((item) => (
                              <li key={`${item.id_proyecto}-${item.id_item}`} className="flex justify-between">
                                <span style={{ color: 'var(--card-subtitle)' }}>{item.nombre}</span>
                                <span className="text-rose-500 font-medium">
                                  {item.cantidad}/{item.stock_minimo}
                                </span>
                              </li>
                            ))}
                            {inventario.stockCritico.length === 0 && (
                              <li className="text-gray-400">Sin ítems críticos</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <EstadoVacio texto="Sin datos de inventario todavía." />
                    )}
                  </Card>

                  <Card title="Ítems más consumidos" subtitle="Top 5 histórico (todas las salidas)">
                    {topConsumo.length > 0 ? (
                      <ul className="space-y-2 text-sm py-1">
                        {topConsumo.map((it, i) => (
                          <li key={i} className="flex justify-between items-center">
                            <span style={{ color: 'var(--card-subtitle)' }}>
                              <span className="font-semibold mr-1">{i + 1}.</span>{it.nombre}
                            </span>
                            <span className="font-semibold" style={{ color: 'var(--card-title)' }}>
                              {it.total_consumido}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <EstadoVacio texto="Sin consumo registrado todavía." />
                    )}
                  </Card>
                </div>

                <Card title="Consumo mensual" subtitle="Todos los proyectos filtrados">
                  {inventario?.consumoMensual?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={inventario.consumoMensual}>
                        <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="total" fill={COLOR_CONSUMO} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EstadoVacio texto="Sin consumo mensual todavía." />
                  )}
                </Card>
              </section>
            )}

            {/* ============ ALERTAS (siempre visibles, son el resumen ejecutivo) ============ */}
            <Card title="Alertas importantes" subtitle={`${alertas.length} activa(s)`}>
              <ul className="space-y-2 text-sm">
                {alertas.map((a, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span>{SEVERIDAD_ICONO[a.severidad] || '⚪'}</span>
                    <span style={{ color: 'var(--card-subtitle)' }}>{a.mensaje}</span>
                  </li>
                ))}
                {alertas.length === 0 && (
                  <li className="text-gray-400">No hay alertas activas.</li>
                )}
              </ul>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

function KpiCard({ label, value, alerta = false }) {
  return (
    <Card className="text-center">
      <p
        className="text-3xl font-bold"
        style={{ color: alerta ? '#f43f5e' : 'var(--card-title)' }}
      >
        {value}
      </p>
      <p className="text-sm mt-1" style={{ color: 'var(--card-subtitle)' }}>
        {label}
      </p>
    </Card>
  );
}

function SeccionTitulo({ texto }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-secondary)' }}>
      {texto}
    </h3>
  );
}

function EstadoVacio({ texto }) {
  return (
    <p className="text-sm text-gray-400 py-8 text-center">{texto}</p>
  );
}
