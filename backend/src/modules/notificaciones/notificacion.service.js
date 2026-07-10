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
 * cada ADMIN/ROOT del sistema. Se llama justo despues de crear
 * un MovimientoInventario con tipo_movimiento = 'SOLICITUD'.
 */
export const notificarSolicitudPendiente = async (movimiento) => {
    try {
        const destinatarios = await obtenerDestinatarios(movimiento.id_proyecto);

        const notificaciones = destinatarios.map((id_usuario) =>
            notificacionRepository.create({
                id_usuario_destinatario: id_usuario,
                tipo: "SOLICITUD_PENDIENTE",
                tipo_referencia: "MOVIMIENTO_INVENTARIO",
                id_referencia: movimiento.id_mov,
                leido: false,
                resuelto: false,
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
 * Notifica al emisor original cuando su SOLICITUD se resuelve. Esta
 * notificación es puramente informativa (no requiere ninguna acción
 * del emisor), así que nace ya con resuelto=true: sirve para historial,
 * pero no debe aparecer en la campana de "pendientes".
 */
export const notificarResolucionSolicitud = async (movimiento) => {
    try {
        const tipo = movimiento.estado_solicitud === "APROBADO"
            ? "SOLICITUD_APROBADA"
            : "SOLICITUD_RECHAZADA";

        const notificacion = notificacionRepository.create({
            id_usuario_destinatario: movimiento.id_emisor,
            tipo,
            tipo_referencia: "MOVIMIENTO_INVENTARIO",
            id_referencia: movimiento.id_mov,
            leido: false,
            resuelto: true,
        });

        const guardada = await notificacionRepository.save(notificacion);
        return [guardada, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * NUEVO: notifica a SUPERVISOR/ENCARGADO del proyecto + ADMIN/ROOT que un
 * EMPLEADO solicitó corregir una asistencia. Mismo patrón que items.
 */
export const notificarSolicitudAsistenciaPendiente = async (solicitud, id_proyecto) => {
    try {
        const destinatarios = await obtenerDestinatariosGestionAsistencia(id_proyecto);

        const notificaciones = destinatarios.map((id_usuario) =>
            notificacionRepository.create({
                id_usuario_destinatario: id_usuario,
                tipo: "SOLICITUD_ASISTENCIA",
                tipo_referencia: "SOLICITUD_ASISTENCIA",
                id_referencia: solicitud.id_solicitud,
                mensaje: "Un empleado solicitó la corrección de un registro de asistencia.",
                leido: false,
                resuelto: false,
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
 * IDs de usuario que deben ser notificados por una solicitud de un
 * proyecto dado: SUPERVISOR de ese proyecto + todos los ADMIN/ROOT.
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

    const adminsYRoot = await obtenerAdminsYRoot();

    const ids = new Set([
        ...supervisoresDelProyecto.map((s) => Number(s.id_usuario)),
        ...adminsYRoot.map((a) => a.id_usuario),
    ]);

    return [...ids];
};

/**
 * NOTA/ASUNCIÓN: igual que obtenerDestinatarios, pero además incluye
 * ENCARGADO del proyecto, porque las rutas de gestión de asistencia
 * (asistencia.routes.js) ya incluyen ENCARGADO como rol habilitado para
 * resolver -- a diferencia de items, donde ENCARGADO nunca puede
 * aprobar/rechazar. Si esto no calza con tu regla de negocio real,
 * ajusta el arreglo de roles de abajo.
 */
const obtenerDestinatariosGestionAsistencia = async (id_proyecto) => {
    const gestionDelProyecto = await usuarioProyectoRepository
        .createQueryBuilder("pu")
        .innerJoin("Usuario", "u", "u.id_usuario = pu.id_usuario")
        .select("u.id_usuario", "id_usuario")
        .where("pu.id_proyecto = :id_proyecto", { id_proyecto })
        .andWhere("pu.activo = true")
        .andWhere("u.rol IN (:...roles)", { roles: ["SUPERVISOR", "ENCARGADO"] })
        .getRawMany();

    const adminsYRoot = await obtenerAdminsYRoot();

    const ids = new Set([
        ...gestionDelProyecto.map((s) => Number(s.id_usuario)),
        ...adminsYRoot.map((a) => a.id_usuario),
    ]);

    return [...ids];
};

/**
 * Todos los usuarios activos con rol ADMIN o ROOT del sistema.
 */
const obtenerAdminsYRoot = async () => {
    return await usuarioRepository.find({
        where: [{ rol: "ADMIN", activo: true }, { rol: "ROOT", activo: true }],
    });
};

/**
 * Genera una notificación por cada ADMIN/ROOT/SUPERVISOR avisando que un
 * usuario solicitó recuperar su contraseña.
 */
export const notificarSolicitudPassword = async (usuario) => {
    try {
        const destinatarios = await usuarioRepository.find({
            where: [
                { rol: "ADMIN", activo: true },
                { rol: "ROOT", activo: true },
                { rol: "SUPERVISOR", activo: true },
            ],
        });

        const mensaje = `${usuario.nombre} ${usuario.apellido} (RUT ${usuario.rut}) solicitó recuperar su contraseña.`;

        const notificaciones = destinatarios.map((admin) =>
            notificacionRepository.create({
                id_usuario_destinatario: admin.id_usuario,
                tipo: "SOLICITUD_PASSWORD",
                tipo_referencia: "USUARIO",
                id_referencia: usuario.id_usuario,
                mensaje,
                leido: false,
                resuelto: false,
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
 * Punto de entrada público (sin JWT): recibe un identificador (email o
 * RUT), busca al usuario y -si existe- notifica a los ADMIN/ROOT.
 */
export const solicitarRecuperacionPassword = async (identifier) => {
    try {
        const valor = (identifier || "").trim();
        if (!valor) return [null, "Debes ingresar tu correo o RUT."];

        const valorRutNormalizado = valor.replace(/\./g, "").toUpperCase();

        const usuario = await usuarioRepository.findOne({
            where: [
                { email: valor, activo: true },
                { rut: valor, activo: true },
                { rut: valorRutNormalizado, activo: true },
            ],
        });

        if (usuario) {
            await notificarSolicitudPassword(usuario);
        }

        return [
            { message: "Si el correo o RUT corresponde a una cuenta registrada, se notificó al equipo administrador." },
            null,
        ];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * NUEVO: marca como resuelto (resuelto=true) TODAS las notificaciones que
 * apunten a una referencia dada. Es el mecanismo genérico que usan los
 * 3 flujos (items, password, asistencia) para "cerrar" la notificación
 * original cuando la acción real ya se ejecutó -- sin depender de que el
 * mismo usuario que vio la notificación sea quien resuelve.
 */
export const marcarResueltasPorReferencia = async ({ tipo_referencia, id_referencia, tipo } = {}) => {
    try {
        if (!tipo_referencia || id_referencia === undefined || id_referencia === null) {
            return [null, "tipo_referencia e id_referencia son obligatorios."];
        }

        const where = { tipo_referencia, id_referencia };
        if (tipo) where.tipo = tipo;

        await notificacionRepository.update(where, { resuelto: true });
        return [true, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * Listado de notificaciones propias del usuario logueado.
 * Soporta filtros opcionales: leido, resuelto, tipo.
 */
export const obtenerMisNotificaciones = async (usuario, filtros = {}) => {
    try {
        const where = { id_usuario_destinatario: usuario.id_usuario || usuario.id };
        if (filtros.leido !== undefined) where.leido = filtros.leido;
        if (filtros.resuelto !== undefined) where.resuelto = filtros.resuelto;
        if (filtros.tipo !== undefined) where.tipo = filtros.tipo;

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