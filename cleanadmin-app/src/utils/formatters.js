/**
 * Convierte una fecha en formato YYYY-MM-DD a DD-MM-AAAA para mostrar.
 */
export function formatearFecha(fecha) {
  if (!fecha) return "—";
  const [anio, mes, dia] = String(fecha).split("T")[0].split("-");
  if (!anio || !mes || !dia) return "—";
  return `${dia}-${mes}-${anio}`;
}

export function formatearHora(hora) {
  if (!hora) return "—";
  const [h, m] = String(hora).split(":");
  if (h === undefined || m === undefined) return "—";
  return `${h}:${m}`;
}

/**
 * Combina fecha + hora en un solo string
 */
export function formatearFechaHora(fecha, hora) {
  const f = formatearFecha(fecha);
  const h = hora ? formatearHora(hora) : null;
  return h ? `${f} • ${h}` : f;
}

/**
 * Fecha y hora en formato DD-MM-AAAA HH:MM.
 */
export function formatearTimestamp(valor) {
  if (!valor) return "—";
  const d = new Date(valor);
  if (isNaN(d.getTime())) return "—";
  const dia  = String(d.getDate()).padStart(2, "0");
  const mes  = String(d.getMonth() + 1).padStart(2, "0");
  const anio = d.getFullYear();
  const hh   = String(d.getHours()).padStart(2, "0");
  const mm   = String(d.getMinutes()).padStart(2, "0");
  return `${dia}-${mes}-${anio} ${hh}:${mm}`;
}
