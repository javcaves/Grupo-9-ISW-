import Joi from "joi";

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

// Se agregan `resuelto` y `tipo` para soportar el historial filtrable.
export const notificacionQueryValidation = Joi.object({
    leido: Joi.boolean().optional(),
    resuelto: Joi.boolean().optional(),
    tipo: Joi.string()
        .valid(
            "SOLICITUD_PENDIENTE",
            "SOLICITUD_APROBADA",
            "SOLICITUD_RECHAZADA",
            "SOLICITUD_PASSWORD",
            "SOLICITUD_ASISTENCIA"
        )
        .optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).default(10).optional(),
});

export const solicitudPasswordValidation = Joi.object({
    identifier: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.empty": "Debes ingresar tu correo o RUT.",
            "any.required": "Debes ingresar tu correo o RUT.",
        }),
});