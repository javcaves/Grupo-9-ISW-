import Joi from "joi";

export const actividadCreateValidation = Joi.object({
    id_cat: Joi.number().integer().positive().required(),
    id_proyecto: Joi.number().integer().positive().required(),
    descripcion_esp: Joi.string().min(5).max(255).required(),
    recurrencia: Joi.string().valid("DIARIA", "SEMANAL", "MENSUAL", "UNICA").required()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false});

export const actividadUpdateValidation = Joi.object({
    id_cat: Joi.number().integer().positive().optional(),
    id_proyecto: Joi.number().integer().positive().optional(),
    descripcion_esp: Joi.string().min(5).max(255).optional(),
    recurrencia: Joi.string().valid("DIARIA", "SEMANAL", "MENSUAL", "UNICA").optional()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const actividadQueryValidation = Joi.object({
    q: Joi.string().min(2).max(100).required()
        .messages({ "any.required": "Debe enviar un término de búsqueda 'q'" })
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const actividadRecurrenciaValidation = Joi.object({
    tipo: Joi.string().valid("DIARIA", "SEMANAL", "MENSUAL", "UNICA").required()
        .messages({ "any.only": "La recurrencia debe ser DIARIA, SEMANAL, MENSUAL o UNICA" })
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });