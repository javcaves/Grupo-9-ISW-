// /src/module/asistencia/asistencia.validations.js
import Joi from "joi";

// Validar la creación de la asistencia (RF-ASISTENCIA-1)
export const asistenciaCreateValidation = Joi.object({
    id_turno: Joi.number().integer().positive().required(),
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

// Validar la edición manual de un registro por el encargado (RF-ASISTENCIA-3 y RF-ASISTENCIA-5)
export const registroIndividualUpdateValidation = Joi.object({
    estado: Joi.string()
        .valid("EN_ESPERA", "PRESENTE", "RETIRADO", "ATRASO", "FALTA_JUSTIFICADA", "FALTA_INJUSTIFICADA")
        .optional(),
    hora_ingreso: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().allow(null),
    hora_egreso: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().allow(null),
    descripcion: Joi.string().max(500).optional().allow(null, ""),
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

// Validar el marcaje por token o QR del empleado (RF-ASISTENCIA-6)
// `tipo` distingue marca de ENTRADA (default, retrocompatible) de SALIDA;
// antes se perdía silenciosamente por stripUnknown:true al no estar declarado.
export const empleadoRegistrarValidation = Joi.object({
    token: Joi.string().length(4).uppercase().required(),
    latitud_emp: Joi.number().required(),
    longitud_emp: Joi.number().required(),
    tipo: Joi.string().valid("ENTRADA", "SALIDA").optional().default("ENTRADA"),
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });