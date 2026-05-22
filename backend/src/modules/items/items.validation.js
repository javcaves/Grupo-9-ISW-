// validaciones para los items y tablas intermedias
/**
 * @file items.validation.js
 * @description Validaciones con Joi para items de bodega y movimientos de inventario
 */


import Joi from 'joi';
 
// 1. ENUMS VALIDOS
 
const TIPOS_ITEM      = ['MAQUINARIA', 'HERRAMIENTA', 'UTENSILIO', 'PRODUCTO'];
const UNIDADES_MEDIDA = ['LITROS', 'UNIDADES', 'KILOS', 'SACOS', 'BOLSAS', 'METROS'];
const TIPOS_CONTROL   = ['CONSUMO', 'PRESTAMO'];
const TIPOS_MOVIMIENTO = ['ENTRADA', 'SALIDA', 'SOLICITUD', 'ABASTECIMIENTO', 'COMPRA'];
 
// 2. VALIDACIONES DE ITEMS
 
// ################# CREAR ITEM #################
export const itemCreateValidation = Joi.object({
    nombre:        Joi.string().min(2).max(100).required(),
    descripcion:   Joi.string().max(500).allow(null, ''),
    tipo:          Joi.string().valid(...TIPOS_ITEM).required(),
    unidad_medida: Joi.string().valid(...UNIDADES_MEDIDA).required(),
    control:       Joi.string().valid(...TIPOS_CONTROL).required()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });
 
// ################# ACTUALIZAR ITEM #################
export const itemUpdateValidation = Joi.object({
    nombre:        Joi.string().min(2).max(100).optional(),
    descripcion:   Joi.string().max(500).allow(null, '').optional(),
    tipo:          Joi.string().valid(...TIPOS_ITEM).optional(),
    unidad_medida: Joi.string().valid(...UNIDADES_MEDIDA).optional(),
    control:       Joi.string().valid(...TIPOS_CONTROL).optional()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });
 
// 3. VALIDACIONES PARA LOS MOVIMIENTOS
 
// ################# REGISTRAR MOVIMIENTO #################
export const movimientoCreateValidation = Joi.object({
    id_item:         Joi.number().integer().positive().allow(null),
    item_sugerido:   Joi.string().max(100).allow(null, ''),
    id_proyecto:     Joi.number().integer().positive().required(),
    id_emisor:       Joi.number().integer().positive().required(),
    id_receptor:     Joi.number().integer().positive().allow(null),
    tipo_movimiento: Joi.string().valid(...TIPOS_MOVIMIENTO).required(),
    cantidad:        Joi.number().integer().min(1).required(),
    descripcion:     Joi.string().max(500).allow(null, '')
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });
 
// ################# RESOLVER SOLICITUD #################
export const solicitudResolucionValidation = Joi.object({
    decision:      Joi.string().valid('APROBADO', 'RECHAZADO').required(),
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
    ).required()
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });
 
