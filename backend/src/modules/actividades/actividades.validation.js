import Joi from "joi";

const textoValido = (value, helpers) => {
    const limpio = value.trim().replace(/\s+/g, " ");
    const primeraPalabra = limpio.split(" ")[0];
    if (/^\d+$/.test(primeraPalabra)) {
        return helpers.error("string.notOnlyNumbers");
    }
    return limpio;
};

const MENSAJES_TEXTO = {
    "string.notOnlyNumbers": '"{{#label}}" no puede empezar solo con números, debe ser un nombre descriptivo',
};

export const actividadCreateValidation = Joi.object({
    id_cat: Joi.number().integer().positive().required(),
    id_proyecto: Joi.number().integer().positive().required(),
    descripcion_esp: Joi.string().min(5).max(255).custom(textoValido).required().messages(MENSAJES_TEXTO),
    recurrencia: Joi.string().valid("DIARIA", "SEMANAL", "MENSUAL", "UNICA").required()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false});

export const actividadUpdateValidation = Joi.object({
    id_cat: Joi.number().integer().positive().optional(),
    id_proyecto: Joi.number().integer().positive().optional(),
    descripcion_esp: Joi.string().min(5).max(255).custom(textoValido).optional().messages(MENSAJES_TEXTO),
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