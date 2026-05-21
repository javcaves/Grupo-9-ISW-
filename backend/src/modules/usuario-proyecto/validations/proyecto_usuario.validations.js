import Joi from "joi";

const ROLES_PROYECTO = ["ENCARGADO", "SUPERVISOR", "EMPLEADO"];

//validaciones de asignacion
export const proyecto_usuarioAsignarValidation = Joi.object({
    id_usuario: Joi.number()
    .integer()
    .positive()
    .messages({
        "number.base": "el id debe ser un numero",
        "number.integer": "el id debe ser un numero entero",
        "number.positive": "el id debe ser un numero positivo"
    }),
    rol_proy: Joi.string()
    .valid(...ROLES_PROYECTO)
    .optional()
    .messages({
        "any.only": `el rol debe ser uno de: ${ROLES_PROYECTO.join(', ')}`,
        "any.required": "el rol del proyecto es obligatorio"
    }),
    fecha_asignacion: Joi.date()
    .iso()
    .default(() => new Date().toISOString()),
    fecha_termino: Joi.date()
    .iso()
    .min(Joi.ref('fecha_asignacion'))
    .optional()
    .messages({
        "date.min": "la fecha de termino no puede ser menor a la de termino"
    })
});

//validacion para desactivar a usuario de proyecto
export const proyecto_usuarioDeactivateValidation = Joi.object({
    id_usurio: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
        "number.base": "el id debe ser un numero",
        "any.required": "el id de usuario es obligatorio"
    })
});

//validacion para actualizar rol de usuario en proyecto

export const proyecto_usuarioUpdateRolValidation = Joi.object({
    rolproyecto: Joi.string()
    .valid(...ROLES_PROYECTO)
    .required()
    .messages({
        "any.only": `El rol debe ser uno de: ${ROLES_PROYECTO.join(', ')}`,
        "any.required": "rol_proyecto es obligatorio"
    })
});

export const usuario_proyectoIdValidation = Joi.object({
    id_proyecto: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
        "number.base": "el id debe ser un numero",
        "number.integer": "el id debe ser un numero entero",
        "number.positive": "el id debe ser un numero positivo",
        "any.required": "el id es un campo obligatorio"
    }),

    id_usuario: Joi.number()
    .integer()
    .positive()
    .optional()
});