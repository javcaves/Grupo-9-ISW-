// src/api/hojaDeVida.service.js

import { api } from "./api";

// ⚠️ Verifica el prefijo real con el que se monta este router en tu app.js /
// index.js del backend. Los comentarios en hojaDeVida.routes.js usan dos
// prefijos distintos ("/api/hoja-vida" y "/api/hoja_de_vida"), así que ajusta
// esta base si no coincide con cómo lo montaste (ej: app.use('/api/hoja-vida', hojaDeVidaRoutes)).
const BASE = "/hoja-vida";

export const HojaDeVidaService = {

  // Estadísticas globales del empleado (todos los proyectos)
  obtenerGlobal(idEmpleado) {
    return api.get(`${BASE}/${idEmpleado}`);
  },

  // Estadísticas del empleado acotadas a un proyecto específico
  obtenerPorProyecto(idProyecto, idEmpleado) {
    return api.get(`${BASE}/proyecto/${idProyecto}/empleado/${idEmpleado}`);
  },

};
