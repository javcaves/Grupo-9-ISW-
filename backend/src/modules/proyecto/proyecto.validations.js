import Joi from "joi";

const ESTADOS_VALIDOS = ["EN_PREPARACION", "EN_CURSO", "FINALIZADO"];
const ROLES_PROYECTO = ["ENCARGADO", "SUPERVISOR", "EMPLEADO"];

//validaciones de query para busqueda
export const proyectoQueryValidation = Joi.object({
    estado: Joi.string()
    .valid(...ESTADOS_VALIDOS)
    .optional(),
    activo: Joi.boolean().optional(),
    incluirInactivos: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .optional()
    .default(false),
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
    // Coordenadas reales para validar geolocalización en el marcaje de
    // asistencia por QR. "ubicacion" de arriba es texto libre (dirección),
    // por eso van separadas. Opcionales para no romper proyectos existentes,
    // pero si no se completan, el marcaje de asistencia se rechaza (fail-safe).
    latitud: Joi.number()
    .min(-90)
    .max(90)
    .optional()
    .messages({
        "number.min": "la latitud debe estar entre -90 y 90",
        "number.max": "la latitud debe estar entre -90 y 90"
    }),
    longitud: Joi.number()
    .min(-180)
    .max(180)
    .optional()
    .messages({
        "number.min": "la longitud debe estar entre -180 y 180",
        "number.max": "la longitud debe estar entre -180 y 180"
    }),
    radio_geocerca: Joi.number()
    .integer()
    .min(10)
    .optional()
    .messages({
        "number.min": "el radio permitido debe ser de al menos 10 metros"
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
    latitud: Joi.number().min(-90).max(90).optional(),
    longitud: Joi.number().min(-180).max(180).optional(),
    radio_geocerca: Joi.number().integer().min(10).optional(),
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