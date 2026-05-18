import Joi from "joi";

export const asignacionCreateValidation = Joi.object({
    id_tarea: Joi.number().integer().positive().required(),
    id_empleado: Joi.number().integer().positive().required(),
    tipo_asignacion: Joi.string().valid("PROGRAMADA", "REASIGNADA").required()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const asignacionUpdateValidation = Joi.object({
    id_empleado: Joi.number().integer().positive().optional(),
    tipo_asignacion: Joi.string().valid("PROGRAMADA", "REASIGNADA").optional()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });