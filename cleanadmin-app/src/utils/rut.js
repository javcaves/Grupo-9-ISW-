// src/utils/rut.js

/**
 * Misma lógica que usuario.validations.js del backend (ya corregida ahí:
 * tenía un typo "cuerpo.legth" en vez de "cuerpo.length" que hacía que
 * casi ningún RUT válido pasara). Se mantiene acá para dar feedback
 * inmediato en el formulario, sin esperar el round-trip al servidor.
 */
export function validarRut(rut) {
  if (!rut) return false;

  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');

  if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();

  if (cuerpo.length < 7 || cuerpo.length > 8) return false;
  if (!/^[0-9]+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  return dv === dvCalculado;
}

/**
 * Da formato "12.345.678-9" a un RUT limpio. Útil para mostrarlo bonito
 * una vez validado; no se usa para la validación en sí.
 */
export function formatearRut(rut) {
  if (!rut) return '';

  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();

  const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${cuerpoConPuntos}-${dv}`;
}
