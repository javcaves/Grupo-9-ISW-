// src/api/dashboard.service.js

import { api } from "./api";

const URL = "/dashboard";

export const DashboardService = {

  // ==================== DASHBOARD / REPORTES ====================

  /**
   * KPIs generales: proyectos activos, empleados, % asistencia,
   * % tareas, stock bajo, cantidad de alertas.
   * filtros: { dias, id_proyecto }
   */
  async obtenerKPIs(filtros = {}) {

    const response = await api.get(
      `${URL}/kpis`,
      filtros
    );

    return response.data;

  },

  /**
   * Serie diaria de % de asistencia (gráfico de líneas).
   */
  async obtenerAsistenciaSerie(filtros = {}) {

    const response = await api.get(
      `${URL}/asistencia`,
      filtros
    );

    return response.data;

  },

  /**
   * Distribución de proyectos por estado (gráfico de dona).
   */
  async obtenerEstadoProyectos(filtros = {}) {

    const response = await api.get(
      `${URL}/proyectos/estado`,
      filtros
    );

    return response.data;

  },

  /**
   * % asistencia + % tareas por proyecto (barras horizontales).
   */
  async obtenerRendimiento(filtros = {}) {

    const response = await api.get(
      `${URL}/rendimiento`,
      filtros
    );

    return response.data;

  },

  /**
   * Stock crítico, solicitudes pendientes y consumo mensual.
   */
  async obtenerInventario(filtros = {}) {

    const response = await api.get(
      `${URL}/inventario`,
      filtros
    );

    return response.data;

  },

  /**
   * Alertas calculadas: asistencia baja, tareas vencidas,
   * stock crítico, proyectos con 100% de tareas completadas.
   */
  async obtenerAlertas(filtros = {}) {

    const response = await api.get(
      `${URL}/alertas`,
      filtros
    );

    return response.data;

  },

};
