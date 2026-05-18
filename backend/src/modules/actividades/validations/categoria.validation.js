import Joi from "joi";

export const categoriaCreateValidation = Joi.object({
    nombre: Joi.string().min(3).max(100).required(),
    descripcion: Joi.string().max(255).allow(null, ""),
    requiere_calificacion: Joi.boolean().required()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const categoriaUpdateValidation = Joi.object({
    nombre: Joi.string().min(3).max(100).optional(),
    descripcion: Joi.string().max(255).allow(null, "").optional(),
    requiere_calificacion: Joi.boolean().optional()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });