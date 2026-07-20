/**
 * Convierte un string "YYYY-MM-DD" (columna `date` del backend, sin hora ni
 * zona) a un Date anclado en medianoche LOCAL. Nunca usar `new Date(fecha)`
 * directo sobre estos strings: el constructor de Date interpreta fechas
 * "solo-fecha" como medianoche UTC (spec de JS), lo que en Chile (UTC-3/-4)
 * se desplaza al día anterior al leer con getters locales.
 */
export function parseFechaLocal(fecha) {
  if (!fecha) return null;
  const [anio, mes, dia] = String(fecha).split("T")[0].split("-").map(Number);
  if (!anio || !mes || !dia) return null;
  return new Date(anio, mes - 1, dia);
}

/**
 * Fecha de hoy en formato "YYYY-MM-DD", en hora LOCAL del navegador (nunca
 * usar `new Date().toISOString().slice(0,10)`, que es UTC y se adelanta un
 * día en la tarde/noche en Chile).
 */
export function hoyLocalISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

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
