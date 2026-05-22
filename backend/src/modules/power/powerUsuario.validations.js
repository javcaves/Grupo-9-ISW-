import Joi from "joi";

//validacion de query para busqueda
export const power_usuarioQueryValidation = Joi.object({
    activo: Joi.boolean().optional(),
    //search: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).default(10).optional()
});

//validaciones de asignacion
export const power_usuarioAsignarValidation = Joi.object({
    powers: Joi.array()
    .items(Joi.string()
        .pattern(/^[A-Z0-9_]+:[A-Z0-9_]+$/)
        .messages({ // 👈 Corregido a plural
            "string.pattern.base":"el poder debe tener formato CODIGO:ACCION"
        })
    )
    .min(1)
    .required()
    .messages({
        "array.base": "powers debe ser un arreglo",
        "array.min": "debe enviar al menos un poder",
        "any.required": "power es un campo obligatorio"
    })
});

//validacion para revocar
export const revocarPowerValidation = Joi.object({
    id_power: Joi.string()
    .pattern(/^[A-Z0-9_]+:[A-Z0-9_]+$/)
    .required()
    .messages({ // 👈 Corregido a plural
        "string.pattern.base":"el poder debe tener formato CODIGO:ACCION",
        "any.required": "id_power es un campo obligatorio"
    })
});

//validacion params
export const power_usuarioIdValidation = Joi.object({
    id_usuario: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
        "number.base": "el id debe ser un numero",
        "number.integer": "el id debe ser un numero entero",
        "number.positive": "el id debe ser un numero positivo",
        "any.required": "el id es un campo obligatorio"
    })
});