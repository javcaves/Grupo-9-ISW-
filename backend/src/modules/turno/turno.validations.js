// turno.validations.js: Validaciones de entrada para endpoints relacionados con turnos, utilizando Joi para definir esquemas de validación robustos. Incluye validaciones específicas para creación y actualización de turnos, así como para asignación de empleados a turnos y configuración de horarios de colación y feriados. [cite: 2788, 2808]
//validaciones con joi
import Joi from "joi";

// Patrón HH:MM para validar horas
const horaPattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

// ==================== TURNO ====================

export const turnoCreateValidation = Joi.object({
    id_proyecto:  Joi.number().integer().positive().required(),
    nombre:       Joi.string().min(3).max(100).required() // 🌟 Agregado
        .messages({ "string.empty": "El nombre del turno no puede estar vacío" }),
    hora_ingreso: Joi.string().pattern(horaPattern).required()
        .messages({ "string.pattern.base": "hora_ingreso debe tener formato HH:MM" }),
    hora_salida:  Joi.string().pattern(horaPattern).required()
        .messages({ "string.pattern.base": "hora_salida debe tener formato HH:MM" }),
    descripcion:  Joi.string().max(255).optional().allow(null, ""),
    empleados: Joi.array().items(
        Joi.object({
            id_empleado:      Joi.number().integer().positive().required(),
            fecha_egreso:     Joi.date().iso().optional().allow(null),
            trabaja_feriados: Joi.boolean().optional().default(false),
        })
    ).min(1).required()
        .messages({ "array.min": "Se requiere al menos un empleado para crear el turno" }),
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const turnoUpdateValidation = Joi.object({
    descripcion: Joi.string().max(255).optional().allow(null, ""),
    activo:      Joi.boolean().optional(),
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

// ==================== TURNO_EMPLEADO ====================

export const turnoEmpleadoAddValidation = Joi.object({
    id_empleado:      Joi.number().integer().positive().required(),
    fecha_ingreso:    Joi.date().iso().optional().allow(null),
    fecha_egreso:     Joi.date().iso().optional().allow(null),
    trabaja_feriados: Joi.boolean().optional().default(false),
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const turnoColacionValidation = Joi.object({
    inicio_colacion: Joi.string().pattern(horaPattern).required()
        .messages({ "string.pattern.base": "inicio_colacion debe tener formato HH:MM" }),
    fin_colacion:    Joi.string().pattern(horaPattern).required()
        .messages({ "string.pattern.base": "fin_colacion debe tener formato HH:MM" }),
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });

export const turnoFeriadoValidation = Joi.object({
    trabaja_feriados: Joi.boolean().required(),
}).options({ allowUnknown: false, stripUnknown: true, abortEarly: false });