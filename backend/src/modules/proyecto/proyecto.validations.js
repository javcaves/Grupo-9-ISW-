import Joi from "joi";

const ESTADOS_VALIDOS = ["EN_PREPARACION", "EN_CURSO", "FINALIZADO"];
const ROLES_PROYECTO = ["ENCARGADO", "SUPERVISOR", "EMPLEADO"];

//validaciones de query para busqueda
export const proyectoQueryValidation = Joi.object({
    estado: Joi.string()
    .valid(...ESTADOS_VALIDOS)
    .optional(),
    activo: Joi.boolean().optional(),
    search: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).default(10).optional()
});


//validaciones para crear POST
export const proyectoCreateValidation = Joi.object({
    nombre: Joi.string()
    .max(100)
    .min(2)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
        "string.empty": "el nombre no puede estar vacio",
        "string.min": "el nombre debe tener al menos 2 caracteres",
        "string.max": "el nombre no debe pasar los 100 caracteres",
        "string.pattern.base": "el nombre solo puede contener letras y espacios",
        "any.required": "el nombre es obligatorio"
    }),
    min_emp: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
        "number.base": "min_emp debe ser un número",
        "string.min": "el minimo de empleados debe tener al menos 1",
        "any.required": "el minimo de empleados es un campo obligatorio"
    }),
    max_emp: Joi.number()
    .integer()
    .min(Joi.ref('min_emp'))
    .required()
    .messages({
        "number.base": "max_emp debe ser un número",
        "string.min": "el maximo de empleados no puede ser menor al minimo",
        "any.required": "el maximo de empleados es un campo obligatorio"
    }),
    ubicacion: Joi.string()
    .min(5)
    .max(200)
    .required()
    .messages({
        "string.min": "la ubicación debe tener al menos 5 caracteres",
        "any.required": "la ubicacion es un campo obligatorio"
    }),
    fecha_inicio: Joi.date()
    .iso()
    .required()
    .messages({
        "date.base": "la fecha de inicio debe ser valida YYYY-MM-DD",
        "any.required": "la fecha es un campo obligatorio"
    }),
    fecha_termino: Joi.date()
    .iso()
    .min(Joi.ref('fecha_inicio'))
    .optional()
    .messages({
        "date.min": "la fecha de termino no puede ser menor a la de termino"
    }),
    estado: Joi.string()
    .valid(...ESTADOS_VALIDOS)
    .default('EN_PREPARACION'),
    supervisores: Joi.array()
    .items(Joi.number().integer().positive())
    .optional(),
    empleados: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
});

//validaciones de actualizacion PUT
export const proyectoUpdateValidation = Joi.object({
    nombre: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .optional(),
    min_emp: Joi.number().integer().min(1).optional(),
    max_emp: Joi.number().integer().min(Joi.ref('min_emp')).optional(),
    ubicacion: Joi.string().min(5).max(200).optional(),
    fecha_inicio: Joi.date().iso().optional(),
    fecha_termino: Joi.date().iso().optional(),
    estado: Joi.string()
    .valid(...ESTADOS_VALIDOS)
    .optional(),
    activo: Joi.boolean().optional()
}).min(1).messages({
    'object.min': 'debe enviar al menos 1 campo para actualizar'
});

//validacion id en params
export const proyectoIdValidation = Joi.object({
    id_proyecto: Joi.number()
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