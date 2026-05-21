import Joi from "joi";

const ROLES_PERMITIDOS = ["ROOT", "ADMIN", "ENCARGADO", "SUPERVISOR", "EMPLEADO", "SIN_ASIG"];

//validaciones de query para busqueda
export const usuarioQueryValidation = Joi.object({
    id_usuario: Joi.number()
    .integer()
    .positive()
    .messages({
        "number.base": "el id debe ser un numero",
        "number.integer": "el id debe ser un numero entero",
        "number.positive": "el id debe ser un numero positivo"
    }),
    rut: Joi.string()
    .min(8)
    .max(15)
    .messages({
        "string.empty": "el rut no puede estar vacio",
        "string.min": "el rut debe tener al menos 8 caracteres",
        "string.max": "el rut no debe pasar los 15 caracteres"
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
    rol: Joi.string()
    .valid(...ROLES_PERMITIDOS)
    .optional()
    .messages({
        "any.only": `el rol debe ser uno de: ${ROLES_PERMITIDOS.join(', ')}`,
        "any.required": "el rol es obligatorio"
    }),
    activo: Joi.boolean().optional()
});

//validaciones de creacion de usuario para POST
export const usuarioCreateValidation = Joi.object({
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
    apellido: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
        "string.empty": "el apellido no puede estar vacio",
        "string.min": "el apellido debe tener al menos 2 caracteres",
        "string.max": "el apellido no debe pasar los 100 caracteres",
        "string.pattern.base": "el apellido solo puede contener letras y espacios",
        "any.required": "el apellido es obligatorio"
    }),
    rut: Joi.string()
    .min(8)
    .max(15)
    .messages({
        "string.empty": "el rut no puede estar vacio",
        "string.min": "el rut debe tener al menos 8 caracteres",
        "string.max": "el rut no debe pasar los 15 caracteres"
    }),
    email: Joi.string()
    .email()
    .required()
    .messages({
        "string.email": "el email no es valido",
        "any.required": "el email es un campo obligatorio"
    }),
    username: Joi.string()
    .min(4)
    .max(30)
    .pattern(/^[a-zA-Z0-9._-]+$/)
    .required()
    .messages({
        "string.min": "el username debe tener al menos 4 caracteres",
        "string.max": "el username no debe pasar los 30 caracteres",
        "string.pattern.base": "el username solo puede contener letras, numeros, puntos o guiones",
        "any.required": "el username es un campo obligatorio"
    }),
    password: Joi.string()
    .min(6)
    .max(8)
    //.pattern(/^[a-zA-Z0-9._-]+$/)
    .required()
    .messages({
        "string.min": "la contraseña debe tener al menos 6 caracteres",
        "string.max": "el username no debe pasar los 8 caracteres",
        //"string.pattern.base": "el la contraseña solo puede contener letras, numeros, puntos o guiones",
        "any.required": "el la contraseña es un campo obligatorio"
    }),
    rol: Joi.string()
    .valid(...ROLES_PERMITIDOS)
    .optional()
    .messages({
        "any.only": `el rol debe ser uno de: ${ROLES_PERMITIDOS.join(', ')}`,
        "any.required": "el rol es obligatorio"
    }),
    numero: Joi.string()
    .pattern(/^\+?569[0-9]{8}$/)
    .optional()
    .messages({
        "string.pattern.base": "el numero debe ser en formato chilenoS"
    }),
    observacion: Joi.string().max(500).optional(),
    powers: Joi.array().items(Joi.string()).optional(),
    search: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).default(10).optional()
})

//validaciones para actualixacion de usuario PUT
export const usuarioUpdateValidation = Joi.object({
    nombre: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .optional(),
    apellido: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .optional(),
    rut: Joi.string()
    .min(8)
    .max(15)
    .optional(),
    email: Joi.string()
    .email()
    .optional(),
    username: Joi.string()
    .min(4)
    .max(30)
    .pattern(/^[a-zA-Z0-9._-]+$/)
    .optional(),
    password: Joi.string()
    .min(6)
    .max(8)
    //.pattern(/^[a-zA-Z0-9._-]+$/)
    .optional(),
    rol: Joi.string()
    .valid(...ROLES_PERMITIDOS)
    .optional(),
    numero: Joi.string()
    .pattern(/^\+?569[0-9]{8}$/)
    .optional(),
    activo: Joi.boolean().optional(),
    observacion: Joi.string().max(500).optional(),
    powers: Joi.array().items(Joi.string()).optional()
}).min(1).messages({
    'object.min': 'debe enviar al menos 1 campo para actualizar'
});

//validacion id en params
export const usuarioIdValidation = Joi.object({
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