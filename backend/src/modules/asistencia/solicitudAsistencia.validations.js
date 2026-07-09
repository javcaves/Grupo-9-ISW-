import Joi from "joi";

export const solicitudAsistenciaCreateValidation = Joi.object({
    id_asistencia: Joi.number().integer().positive().required(),
    estado_solicitado: Joi.string()
        .valid("PRESENTE", "ATRASO", "FALTA_INJUSTIFICADA", "FALTA_JUSTIFICADA", "EN_ESPERA", "RETIRADO")
        .optional(),
    hora_ingreso_solicitada: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().allow(null),
    hora_egreso_solicitada: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().allow(null),
    motivo: Joi.string().min(5).max(500).required(),
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const solicitudAsistenciaResolverValidation = Joi.object({
    decision: Joi.string().valid("APROBADO", "RECHAZADO").required(),
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const solicitudAsistenciaIdValidation = Joi.object({
    id_solicitud: Joi.number().integer().positive().required(),
});