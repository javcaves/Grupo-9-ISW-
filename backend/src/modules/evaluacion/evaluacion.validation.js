import Joi from "joi";

export const evaluacionCreateValidation = Joi.object({
    id_tarea: Joi.number().integer().positive().required(),
    id_empleado: Joi.number().integer().positive().required(),
    cumplio: Joi.boolean().required(),
    calificacion: Joi.number().integer().min(1).max(5).required(),
    // Si no cumplió, la justificación es obligatoria 
    comentario: Joi.string().max(500).when("cumplio", {
        is: false,
        then: Joi.string().min(5).required(),
        otherwise: Joi.string().allow(null, "").optional(),
    }),
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });
