/**
 * Esquemas de validación para el módulo de Asistencia
 */

const ESTADOS_PERMITIDOS = [
    "EN_ESPERA", 
    "ASISTIDO", 
    "RETIRADO", 
    "ATRASO", 
    "FALTA JUSTIFICADA", 
    "FALTA_INJUSTIFICADA"
];

/**
 * Valida la creación de una nueva asistencia (Cabecera y Token)
 */
export const validarCreacionAsistencia = (req, res, next) => {
    const { id_turno } = req.body;

    if (!id_turno || typeof id_turno !== 'number') {
        return res.status(400).json({
            success: false,
            error: "Debe proporcionar un id_turno válido (numérico) para generar la asistencia."
        });
    }

    next();
};

/**
 * Valida la marcación manual o edición por parte del Encargado/Supervisor
 */
export const validarEdicionAsistencia = (req, res, next) => {
    const { estado, hora_ingreso, descripcion } = req.body;
    const errores = [];

    // Validar Estado si viene en el body
    if (estado && !ESTADOS_PERMITIDOS.includes(estado)) {
        errores.push(`Estado inválido. Los permitidos son: ${ESTADOS_PERMITIDOS.join(', ')}`);
    }

    // Validar Formato de Hora (HH:mm) si viene en el body
    const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (hora_ingreso && !regexHora.test(hora_ingreso)) {
        errores.push("El formato de hora_ingreso debe ser HH:mm (ej: 08:30).");
    }

    // Validar descripción (evitar textos gigantes)
    if (descripcion && descripcion.length > 255) {
        errores.push("La descripción no puede exceder los 255 caracteres.");
    }

    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            errores
        });
    }

    next();
};

/**
 * Valida el registro automático del empleado mediante Token
 */
export const validarRegistroToken = (req, res, next) => {
    const { token } = req.body;

    // Validar que el token sea un string de 6 caracteres (según definimos en el service)
    if (!token || typeof token !== 'string' || token.trim().length !== 6) {
        return res.status(400).json({
            success: false,
            error: "El token debe ser un código alfanumérico de 6 caracteres."
        });
    }

    next();
};