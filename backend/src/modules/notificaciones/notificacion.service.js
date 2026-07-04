/**
 * @typedef {Object} Notificacion
 * @property {number} id_notificacion
 * @property {number} id_usuario_destinatario
 * @property {string} tipo
 * @property {number} id_movimiento
 * @property {boolean} leido
 * @property {string} fecha
 */

import { AppDataSource } from '../../config/ConfigDB.js';

const notificacionRepository = AppDataSource.getRepository('Notificacion');
const usuarioRepository = AppDataSource.getRepository('Usuario');
const usuarioProyectoRepository = AppDataSource.getRepository('ProyectoUsuario');

/**
 * Genera una notificacion por cada SUPERVISOR activo del proyecto +
 * cada ADMIN/ROOT del sistema (los mismos roles habilitados para
 * PATCH /movimientos/:id_mov/resolver). Se llama justo despues de crear
 * un MovimientoInventario con tipo_movimiento = 'SOLICITUD'.
 *
 * @param {Object} movimiento - fila de MovimientoInventario ya guardada
 *   (debe traer id_mov e id_proyecto)
 */
export const notificarSolicitudPendiente = async (movimiento) => {
    try {
        const destinatarios = await obtenerDestinatarios(movimiento.id_proyecto);

        const notificaciones = destinatarios.map((id_usuario) =>
            notificacionRepository.create({
                id_usuario_destinatario: id_usuario,
                tipo: "SOLICITUD_PENDIENTE",
                id_movimiento: movimiento.id_mov,
                leido: false,
            })
        );

        if (notificaciones.length > 0) {
            await notificacionRepository.save(notificaciones);
        }

        return [notificaciones, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * Notifica al emisor original (quien pidio la SOLICITUD) cuando esta se
 * resuelve. Se llama despues de resolverSolicitud en items.service.js.
 *
 * @param {Object} movimiento - fila de MovimientoInventario ya resuelta
 *   (debe traer id_mov, id_emisor y estado_solicitud)
 */
export const notificarResolucionSolicitud = async (movimiento) => {
    try {
        const tipo = movimiento.estado_solicitud === "APROBADO"
            ? "SOLICITUD_APROBADA"
            : "SOLICITUD_RECHAZADA";

        const notificacion = notificacionRepository.create({
            id_usuario_destinatario: movimiento.id_emisor,
            tipo,
            id_movimiento: movimiento.id_mov,
            leido: false,
        });

        const guardada = await notificacionRepository.save(notificacion);
        return [guardada, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * IDs de usuario que deben ser notificados por una solicitud de un
 * proyecto dado: SUPERVISOR de ese proyecto (via join, mismo patron que
 * proyecto.service) + todos los ADMIN/ROOT del sistema.
 */
const obtenerDestinatarios = async (id_proyecto) => {
    const supervisoresDelProyecto = await usuarioProyectoRepository
        .createQueryBuilder("pu")
        .innerJoin("Usuario", "u", "u.id_usuario = pu.id_usuario")
        .select("u.id_usuario", "id_usuario")
        .where("pu.id_proyecto = :id_proyecto", { id_proyecto })
        .andWhere("pu.activo = true")
        .andWhere("u.rol = :rol", { rol: "SUPERVISOR" })
        .getRawMany();

    const adminsYRoot = await usuarioRepository.find({
        where: [{ rol: "ADMIN", activo: true }, { rol: "ROOT", activo: true }],
    });

    const ids = new Set([
        ...supervisoresDelProyecto.map((s) => Number(s.id_usuario)),
        ...adminsYRoot.map((a) => a.id_usuario),
    ]);

    return [...ids];
};

/**
 * Listado de notificaciones propias del usuario logueado.
 */
export const obtenerMisNotificaciones = async (usuario, filtros = {}) => {
    try {
        const where = { id_usuario_destinatario: usuario.id_usuario || usuario.id };
        if (filtros.leido !== undefined) where.leido = filtros.leido;

        const notificaciones = await notificacionRepository.find({
            where,
            order: { fecha: 'DESC' },
        });

        return [notificaciones, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * Marca una notificacion como leida (solo el propio destinatario).
 */
export const marcarLeida = async (id_notificacion, usuario) => {
    try {
        const notificacion = await notificacionRepository.findOne({
            where: { id_notificacion: parseInt(id_notificacion) },
        });

        if (!notificacion) throw new Error('notificacion no encontrada');

        const id_usuario_actual = usuario.id_usuario || usuario.id;
        if (notificacion.id_usuario_destinatario !== id_usuario_actual) {
            throw new Error('no puedes marcar como leida una notificacion que no es tuya');
        }

        notificacion.leido = true;
        const actualizada = await notificacionRepository.save(notificacion);
        return [actualizada, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * Marca todas las notificaciones propias como leidas.
 */
export const marcarTodasLeidas = async (usuario) => {
    try {
        const id_usuario_actual = usuario.id_usuario || usuario.id;

        await notificacionRepository.update(
            { id_usuario_destinatario: id_usuario_actual, leido: false },
            { leido: true }
        );

        return [{ message: 'notificaciones marcadas como leidas' }, null];
    } catch (error) {
        return [null, error.message];
    }
};
