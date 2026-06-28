// src/components/qr/qr.utils.js

/**
 * Convierte un QR leído en un objeto.
 *
 * Soporta:
 *
 * QR antiguo:
 * TOKEN123456
 *
 * QR moderno:
 * {
 *   "token":"TOKEN123456",
 *   "lat":-36.782,
 *   "lng":-73.045,
 *   "radio":200,
 *   "proyecto":"Fundo Norte",
 *   "turno":"Mañana",
 *   "exp":"2026-06-28T20:00:00"
 * }
 */
export function parseQR(rawValue) {

    if (!rawValue)
        throw new Error("El código QR está vacío.");

    try {

        const json = JSON.parse(rawValue);

        if (!json.token)
            throw new Error();

        return json;

    }

    catch {

        return {
            token: rawValue.trim(),
        };

    }

}

/**
 * Distancia entre dos coordenadas usando la fórmula de Haversine.
 * Retorna la distancia en metros.
 */
export function calcularDistanciaMetros(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371000;

    const toRad = (grados) => grados * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);

}

/**
 * Indica si una ubicación está dentro del radio permitido.
 */
export function dentroDelRadio(
    latEmpleado,
    lonEmpleado,
    latProyecto,
    lonProyecto,
    radio = 200
) {

    const distancia = calcularDistanciaMetros(

        latEmpleado,
        lonEmpleado,

        latProyecto,
        lonProyecto

    );

    return {

        permitido: distancia <= radio,

        distancia,

        radio,

    };

}

/**
 * Verifica si el QR expiró.
 */
export function qrExpirado(fechaExpiracion) {

    if (!fechaExpiracion)
        return false;

    return new Date() > new Date(fechaExpiracion);

}

/**
 * Valida completamente un QR.
 */
export function validarQR(qr) {

    if (!qr.token)
        throw new Error("El QR no contiene un token válido.");

    if (qr.exp && qrExpirado(qr.exp))
        throw new Error("El código QR ya expiró.");

    return true;

}