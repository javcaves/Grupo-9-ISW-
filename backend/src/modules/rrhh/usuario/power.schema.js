/**
 * Middleware de validación para la gestión de Poderes (Permissions)
 */
export const validarAsignacionPower = (req, res, next) => {
    const { powers } = req.body;
    const { idDestino } = req.params;
    const errores = [];

    // 1. Validar que el ID de destino sea un número válido
    if (!idDestino || isNaN(parseInt(idDestino))) {
        errores.push("El ID del usuario destino es obligatorio y debe ser un número.");
    }

    // 2. Validar que 'powers' sea un arreglo
    if (!powers) {
        errores.push("El campo 'powers' es obligatorio.");
    } else if (!Array.isArray(powers)) {
        errores.push("El campo 'powers' debe ser un arreglo (Array) de strings.");
    } else {
        // 3. Validar que el arreglo no esté vacío (Opcional, según tu lógica)
        // Si permites quitar todos los poderes, podrías dejar que el array venga vacío.
        
        // 4. Validar que todos los elementos sean strings y sigan el formato CODIGO:ACCION
        const regexPower = /^[A-Z0-9_]+:[A-Z0-9_]+$/;
        
        powers.forEach((p, index) => {
            if (typeof p !== 'string') {
                errores.push(`El elemento en la posición ${index} debe ser un string.`);
            } else if (!regexPower.test(p)) {
                errores.push(`El poder '${p}' no cumple con el formato estándar (EJEMPLO: 'USER:READ').`);
            }
        });

        // 5. Verificar duplicados en el mismo request
        const duplicados = powers.filter((item, index) => powers.indexOf(item) !== index);
        if (duplicados.length > 0) {
            errores.push(`Se enviaron poderes duplicados: ${[...new Set(duplicados)].join(', ')}`);
        }
    }

    // Si hay errores de estructura, respondemos 400 Bad Request
    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Estructura de poderes inválida",
            detalles: errores
        });
    }

    next();
};

/**
 * Esquema de validación para consultas de catálogo (opcional)
 */
export const validarQueryCatalogo = (req, res, next) => {
    // Aquí podrías validar si se filtran poderes por categoría en el futuro
    next();
};

export default {
    validarAsignacionPower
};