import Joi from "joi";

//validacion id_notificacion en params
export const notificacionIdValidation = Joi.object({
    id_notificacion: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "el id debe ser un numero",
            "any.required": "el id es un campo obligatorio",
        }),
});

//validaciones de query para listar
export const notificacionQueryValidation = Joi.object({
    leido: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).default(10).optional(),
});
