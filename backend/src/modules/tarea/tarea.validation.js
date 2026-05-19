import Joi from "joi";

export const tareaCreateValidation = Joi.object({
    id_act: Joi.number().integer().positive().required(),
    fecha: Joi.date().iso().required(),
    hora: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).required(),
    comentario: Joi.string().max(255).allow(null, "")
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const tareaUpdateValidation = Joi.object({
    fecha: Joi.date().iso().optional(),
    hora: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).optional(),
    comentario: Joi.string().max(255).optional()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const tareaCancelValidation = Joi.object({
    estado: Joi.string().valid("INCOMPLETA", "CANCELADA").required(),
    comentario: Joi.string().min(5).max(255).required() // Obligatorio para cancelar
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });