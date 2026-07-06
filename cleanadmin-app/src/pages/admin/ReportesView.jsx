// pages/admin/ReportesView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';

import { ADMIN_CONFIG } from '../../data/adminConfig';
import LayoutContent from '../../layouts/LayoutContent';
import { Card } from '../../components/Card';
import { DashboardService } from '../../api/dashboard.service';
import { ProyectoService } from '../../api/proyecto.service';

const COLORES_ESTADO = {
  EN_PREPARACION: '#f59e0b',
  EN_CURSO: '#6366f1',
  FINALIZADO: '#10b981',
};

const COLOR_ASISTENCIA = '#6366f1';
const COLOR_TAREAS = '#10b981';
const COLOR_CONSUMO = '#f59e0b';

const SEVERIDAD_ICONO = {
  ROJO: '🔴',
  AMARILLO: '🟡',
  VERDE: '🟢',
};

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lista de proyectos para el filtro (se carga una sola vez)
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
      ] = await Promise.all([
        DashboardService.obtenerKPIs(filtros),
        DashboardService.obtenerAsistenciaSerie(filtros),
        DashboardService.obtenerEstadoProyectos(filtros),
        DashboardService.obtenerRendimiento(filtros),
        DashboardService.obtenerInventario(filtros),
        DashboardService.obtenerAlertas(filtros),
      ]);

      setKpis(kpisRes);
      setAsistenciaSerie(Array.isArray(asistenciaRes) ? asistenciaRes : []);
      setEstadoProyectos(Array.isArray(estadoRes) ? estadoRes : []);
      setRendimiento(Array.isArray(rendimientoRes) ? rendimientoRes : []);
      setInventario(inventarioRes);
      setAlertas(Array.isArray(alertasRes) ? alertasRes : []);
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

  // El botón "Generar PDF" viene de adminConfig solo con texto/clase (estático);
  // acá conectamos el onClick real, sin tocar la config compartida.
  const acciones = content.actions.map((accion) => {
    if (accion.text === 'Generar PDF') {
      return { ...accion, onClick: () => window.print() };
    }
    return accion;
  });

  return (
    <>
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

      {/* Filtros: proyecto + periodo */}
      <div className="flex flex-wrap gap-3 my-6">
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
      </div>

      {error && (
        <div className="text-sm text-rose-500 mb-4">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Asistencia + Estado de proyectos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card title="Asistencia" subtitle={`Últimos ${dias} días`}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={asistenciaSerie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Asistencia']} />
                  <Line type="monotone" dataKey="porcentaje" stroke={COLOR_ASISTENCIA} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Estado de proyectos" subtitle="Distribución actual">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={estadoProyectos}
                    dataKey="cantidad"
                    nameKey="estado"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {estadoProyectos.map((entry) => (
                      <Cell key={entry.estado} fill={COLORES_ESTADO[entry.estado] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Rendimiento por proyecto + Inventario */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card title="Rendimiento por proyecto" subtitle="% asistencia y % tareas">
              <ResponsiveContainer width="100%" height={Math.max(260, rendimiento.length * 50)}>
                <BarChart data={rendimiento} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="nombre_proy" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Legend />
                  <Bar dataKey="porcentajeAsistencia" name="Asistencia" fill={COLOR_ASISTENCIA} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="porcentajeTareas" name="Tareas" fill={COLOR_TAREAS} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Inventario" subtitle="Stock crítico y solicitudes">
              {inventario && (
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

                  <div>
                    <p className="mb-2 font-medium" style={{ color: 'var(--card-title)' }}>
                      Consumo mensual
                    </p>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={inventario.consumoMensual}>
                        <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="total" fill={COLOR_CONSUMO} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Alertas */}
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
