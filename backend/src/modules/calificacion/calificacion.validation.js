import Joi from "joi";

export const calificacionCreateValidation = Joi.object({
    id_cat: Joi.number().integer().positive().required(),
    id_empleado: Joi.number().integer().positive().required()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });