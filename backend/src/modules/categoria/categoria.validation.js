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

export const categoriaCreateValidation = Joi.object({
    nombre: Joi.string().min(3).max(100).custom(textoValido).required().messages(MENSAJES_TEXTO),
    descripcion: Joi.string().max(255).allow(null, ""),
    requiere_calificacion: Joi.boolean().required()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const categoriaUpdateValidation = Joi.object({
    nombre: Joi.string().min(3).max(100).custom(textoValido).optional().messages(MENSAJES_TEXTO),
    descripcion: Joi.string().max(255).allow(null, "").optional(),
    requiere_calificacion: Joi.boolean().optional()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });