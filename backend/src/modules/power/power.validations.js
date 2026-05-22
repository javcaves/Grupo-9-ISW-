import Joi from "joi";

const CATEGORIAS_POWER = ["USUARIO", "PROYECTO", "BODEGA", "ACTIVIDAD", "ASISTENCIA"];


//validacion de query para busqueda
export const powerQueryValidation = Joi.object({
    categoria: Joi.string()
    .valid(...CATEGORIAS_POWER)
    .required()
    .messages({
        "any.only": `Categoría no válida. Opciones: ${CATEGORIAS_POWER.join(', ')}`,
        "any.required": "la categorua es un campo obligatorio"
    }),
    activo: Joi.boolean().optional(),
    search: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).default(10).optional()
});


//validacion para asignar poderes POST
export const asignarPowerValidation = Joi.object({
    powers: Joi.array()
    .items(Joi.string()
        .pattern(/^[A-Z0-9_]+:[A-Z0-9_]+$/)
        .messages({
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

//validacion para crear nuevo poder con ROOT
export const powerCreateValidation = Joi.object({
    id_power: Joi.string()
    .pattern(/^[A-Z0-9_]+:[A-Z0-9_]+$/)
    .required()
    .messages({
        "string.pattern.base":"el poder debe tener formato CODIGO:ACCION",
        "any.required": "id_power es un campo obligatorio"
    }),
    nombre: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
        "string.empty": "el nombre no puede estar vacio",
        "string.min": "el nombre debe tener al menos 2 caracteres",
        "string.max": "el nombre no debe pasar los 100 caracteres",
        "string.pattern.base": "el nombre solo puede contener letras y espacios",
        "any.required": "el nombre es obligatorio"
    }),
    descripcion: Joi.string().max(500).optional(),
    categoria: Joi.string()
    .valid(...CATEGORIAS_POWER)
    .required()
    .messages({
        "any.only": `Categoría no válida. Opciones: ${CATEGORIAS_POWER.join(', ')}`,
        "any.required": "la categorua es un campo obligatorio"
    }),
    activo: Joi.boolean().default(true)
});

//validacion para actualizar poderes PUT
export const powerUpdateValidation = Joi.object({
    nombre: Joi.string().min(2).max(100).pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).optional(),
    descripcion: Joi.string().max(500).optional(),
    categoria: Joi.string()
    .valid(...CATEGORIAS_POWER)
    .optional(),
    activo: Joi.boolean().optional()
}).min(1).messages({
    'object.min': 'debe enviar al menos 1 campo para actualizar'
});

//validacion id en params
export const powerIdValidation = Joi.object({
    id: Joi.number()
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