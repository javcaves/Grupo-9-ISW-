// src/utils/formatTime.js

/**
 * Normaliza cualquier valor de hora del backend a formato "HH:MM".
 *
 * Soporta:
 *  - "14:32:00" / "14:32"        (columna TIME, ej. turno.hora_ingreso -> hora PROGRAMADA)
 *  - "2026-07-07T14:32:00.000Z"  (timestamp ISO, ej. asistencia.hora_ingreso -> hora REAL de marcaje)
 *  - "2026-07-07 14:32:00"       (timestamp con espacio)
 *  - Date u otro valor parseable por `new Date(...)`
 *
 * El bug original truncaba con `.substring(0, 5)` asumiendo siempre el formato
 * "HH:MM:SS", lo cual funciona para las horas PROGRAMADAS del turno (columna TIME)
 * pero rompe apenas el backend entrega la hora REAL de marcaje como timestamp
 * completo (ej. devuelve "2026-" en vez de la hora).
 *
 * Devuelve null si no hay valor, para que el componente decida el placeholder
 * ("--:--", "Pendiente", etc.).
 */
export function formatHora(valor) {
  if (!valor) return null;

  // Caso "HH:MM" o "HH:MM:SS" puro (columna TIME de la BD)
  if (typeof valor === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(valor.trim())) {
    return valor.trim().substring(0, 5);
  }

  // Caso timestamp/fecha completa -> extraer la hora en horario local
  const fecha = new Date(valor);

  if (!Number.isNaN(fecha.getTime())) {
    return fecha.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  // Último recurso: devolver tal cual venga, para no ocultar el dato
  return String(valor);
}
