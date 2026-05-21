import validators from '../../shared/validators.js';

/**
 * ROLES permitidos según el sistema de RRHH
 */
const ROLES_PERMITIDOS = ["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO", "EMPLEADO", "SIN_ASIGNAR"];

/**
 * Determina si un RUT pertenece a una persona natural (Chile)
 * Personas naturales: < 50.000.000
 * Personas jurídicas (Empresas): >= 50.000.000
 */
const esRutPersonaNatural = (rut) => {
    if (!rut) return false;
    // Limpiamos puntos y extraemos el cuerpo numérico antes del guion
    const cuerpo = parseInt(rut.split('-')[0].replace(/\./g, ''), 10);
    return cuerpo < 50000000;
};

/**
 * Definición de reglas por campo
 */
const reglas = {
    nombre: {
        pattern: /^[a-zA-ZÀ-ÿ\s]{2,40}$/,
        error: "El nombre debe contener solo letras y tener entre 2 y 40 caracteres."
    },
    apellido: {
        pattern: /^[a-zA-ZÀ-ÿ\s]{2,40}$/,
        error: "El apellido debe contener solo letras y tener entre 2 y 40 caracteres."
    },
    rut: {
        custom: (val) => validators.esRutValido(val) && esRutPersonaNatural(val),
        error: "El RUT debe ser válido y corresponder a una Persona Natural (menor a 50M)."
    },
    email: {
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        error: "El formato del correo electrónico no es válido."
    },
    username: {
        pattern: /^[a-zA-Z0-9._-]{4,20}$/,
        error: "El username debe tener entre 4 y 20 caracteres (letras, números, puntos o guiones)."
    },
    password: {
        min: 6,
        error: "La contraseña debe tener al menos 6 caracteres."
    },
    rol: {
        custom: (val) => ROLES_PERMITIDOS.includes(val),
        error: `El rol debe ser uno de los siguientes: ${ROLES_PERMITIDOS.join(", ")}.`
    },
    numero: {
        pattern: /^\+?569[0-9]{8}$/,
        error: "El número debe ser un formato chileno válido (ej: +56912345678)."
    }
};

/**
 * Middleware Principal de Validación
 */
export const validarUsuario = (req, res, next) => {
    const data = req.body;
    const errores = [];
    const esUpdate = req.method === 'PUT' || req.method === 'PATCH';

    // 1. Campos obligatorios solo en CREACIÓN (POST)
    const obligatorios = ['nombre', 'apellido', 'rut', 'email', 'username', 'password', 'rol'];
    
    if (!esUpdate) {
        obligatorios.forEach(campo => {
            if (!data[campo] || (typeof data[campo] === 'string' && data[campo].trim() === "")) {
                errores.push(`El campo '${campo}' es obligatorio para el registro.`);
            }
        });
    }

    // 2. Validar formatos de los campos presentes en el body
    for (const campo in reglas) {
        const valor = data[campo];
        const regla = reglas[campo];

        // Solo validamos si el valor viene en el body (para permitir updates parciales)
        if (valor !== undefined && valor !== null && valor !== "") {
            
            // Validar Patrón (Regex)
            if (regla.pattern && !regla.pattern.test(valor)) {
                errores.push(`${campo.toUpperCase()}: ${regla.error}`);
            }

            // Validar Lógica personalizada (RUT y Roles)
            if (regla.custom && !regla.custom(valor)) {
                errores.push(`${campo.toUpperCase()}: ${regla.error}`);
            }

            // Validar Largo mínimo (Password)
            if (regla.min && String(valor).length < regla.min) {
                errores.push(`${campo.toUpperCase()}: ${regla.error}`);
            }
        }
    }

    // 3. Validar Estructura de Powers (Checklist)
    if (data.powers) {
        if (!Array.isArray(data.powers)) {
            errores.push("POWERS: Debe ser un arreglo de identificadores (strings).");
        } else if (data.powers.some(p => typeof p !== 'string')) {
            errores.push("POWERS: Todos los elementos deben ser cadenas de texto.");
        }
    }

    // Si hay errores, frenamos la petición aquí
    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Error de validación en los datos enviados",
            detalles: errores
        });
    }

    next();
};

export default {
    validarUsuario
};