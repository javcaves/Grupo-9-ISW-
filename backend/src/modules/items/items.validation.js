/**
 * @file items.validation.js
 * @description Validaciones con Joi para items de bodega y movimientos de inventario
 */
import Joi from 'joi';

// 1. ENUMS VALIDOS
const TIPOS_ITEM       = ['MAQUINARIA', 'HERRAMIENTA', 'UTENSILIO', 'PRODUCTO'];
const UNIDADES_MEDIDA  = ['LITROS', 'UNIDADES', 'KILOS', 'SACOS', 'BOLSAS', 'METROS'];
const TIPOS_CONTROL    = ['CONSUMO', 'PRESTAMO'];
const TIPOS_MOVIMIENTO = ['ENTRADA', 'SALIDA', 'SOLICITUD', 'ABASTECIMIENTO', 'COMPRA'];

// ================= VALIDACIONES DE ITEMS =================
export const itemCreateValidation = Joi.object({
    nombre:        Joi.string().min(2).max(100).required()
                        .messages({ "any.required": "El nombre del ítem es obligatorio." }),
    descripcion:   Joi.string().max(500).allow(null, ''),
    tipo:          Joi.string().valid(...TIPOS_ITEM).required()
                        .messages({ "any.only": `El tipo debe ser uno de: ${TIPOS_ITEM.join(', ')}` }),
    unidad_medida: Joi.string().valid(...UNIDADES_MEDIDA).required(),
    control:       Joi.string().valid(...TIPOS_CONTROL).required()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const itemUpdateValidation = Joi.object({
    nombre:        Joi.string().min(2).max(100).optional(),
    descripcion:   Joi.string().max(500).allow(null, '').optional(),
    tipo:          Joi.string().valid(...TIPOS_ITEM).optional(),
    unidad_medida: Joi.string().valid(...UNIDADES_MEDIDA).optional(),
    control:       Joi.string().valid(...TIPOS_CONTROL).optional()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

// ================= VALIDACIONES PARA LOS MOVIMIENTOS =================

// id_item es obligatorio para todo movimiento que NO sea SOLICITUD.
// Para SOLICITUD, es opcional (puede pedirse un item aún no registrado vía item_sugerido).
export const movimientoCreateValidation = Joi.object({
    id_item: Joi.number().integer().positive()
        .when('tipo_movimiento', {
            is: 'SOLICITUD',
            then: Joi.optional().allow(null),
            otherwise: Joi.required().messages({
                "any.required": "El id_item es obligatorio para este tipo de movimiento.",
                "number.base": "El id_item es obligatorio para este tipo de movimiento."
            })
        }),
    item_sugerido:   Joi.string().max(100).allow(null, ''),
    id_proyecto:     Joi.number().integer().positive().required()
                        .messages({ "any.required": "Debe indicar el proyecto afectado." }),
    id_emisor:       Joi.number().integer().positive().required(),
    id_receptor:     Joi.number().integer().positive().allow(null),
    tipo_movimiento: Joi.string().valid(...TIPOS_MOVIMIENTO).required(),
    cantidad:        Joi.number().integer().min(1).required()
                        .messages({ "number.min": "La cantidad del movimiento debe ser al menos 1." }),
    descripcion:     Joi.string().max(500).allow(null, '')
})
    .options({ allowUnknown: false, stripUnknown: true, abortEarly: false })
    .custom((value, helpers) => {
        // Para SOLICITUD: debe venir id_item O item_sugerido (no ambos vacíos)
        if (value.tipo_movimiento === 'SOLICITUD') {
            const tieneItem = value.id_item != null;
            const tieneSugerido = value.item_sugerido != null && value.item_sugerido.trim() !== '';
            if (!tieneItem && !tieneSugerido) {
                return helpers.message('Debe indicar un id_item existente o proponer un item_sugerido para la solicitud.');
            }
        }
        return value;
    });

export const solicitudResolucionValidation = Joi.object({
    decision:      Joi.string().valid('APROBADO', 'RECHAZADO').required()
                        .messages({ "any.required": "Debe indicar si aprueba o rechaza la solicitud." }),
    nombre:        Joi.string().min(2).max(100).optional(),
    tipo:          Joi.string().valid(...TIPOS_ITEM).optional(),
    unidad_medida: Joi.string().valid(...UNIDADES_MEDIDA).optional(),
    control:       Joi.string().valid(...TIPOS_CONTROL).optional()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const actualizarInventarioValidation = Joi.object({
    id_emisor: Joi.number().integer().positive().required(),
    items: Joi.array().items(
        Joi.object({
            id_item: Joi.number().integer().positive().required(),
            cantidad: Joi.number().integer().min(0).required(),
            stock_minimo: Joi.number().integer().min(0).required()
        })
    ).min(1).required().messages({
        "any.required": "La lista de ítems auditados no puede estar vacía.",
        "array.min": "La lista de ítems auditados no puede estar vacía."
    })
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

// ================= VALIDACIÓN PARA VINCULAR ITEM EXISTENTE A UN PROYECTO =================
export const vincularItemValidation = Joi.object({
    id_item:      Joi.number().integer().positive().required()
                    .messages({ "any.required": "Debe indicar qué item vincular." }),
    id_proyecto:  Joi.number().integer().positive().required(),
    cantidad:     Joi.number().integer().min(0).default(0),
    stock_minimo: Joi.number().integer().min(0).default(0),
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });