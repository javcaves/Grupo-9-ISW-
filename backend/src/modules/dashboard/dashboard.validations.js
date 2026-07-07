import Joi from 'joi';

/**
 * Filtros aceptados por todos los endpoints del dashboard.
 * - dias: ventana de tiempo hacia atrás desde hoy (default 30, aplicado en el service)
 * - id_proyecto: si se envía, todo se filtra a ese proyecto en particular
 */
export const dashboardFiltrosValidation = Joi.object({
    dias: Joi.number().integer().min(1).max(365).optional(),
    id_proyecto: Joi.number().integer().positive().optional(),
});
