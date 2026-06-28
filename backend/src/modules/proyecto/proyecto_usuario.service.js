/**
 * @typedef {Object} ProyectoUsuario
 * @property {number} id_proyecto - Referencia al ID del proyecto
 * @property {number} id_usuario - Referencia al ID del usuario (Encargado, Supervisor, Empleado)
 * @property {string} fecha_asignacion - Fecha en que se vinculó al proyecto (ISO string)
 * @property {string|null} fecha_termino - Fecha de desvinculación o finalización (ISO string o null)
 * @property {boolean} activo - Define si la vinculación está vigente actualmente
 */
import { AppDataSource } from '../../config/ConfigDB.js';

const ProyectoUsuarioRepository = AppDataSource.getRepository('ProyectoUsuario');
const UsuarioRepository = AppDataSource.getRepository('Usuario');

export const obtenerUsuariosDelProyecto = async (idProyecto, filtros = {}) => {
    try {
        const where = { id_proyecto: parseInt(idProyecto), activo: true };

        if (filtros.rol) {
            where.rol_proyecto = filtros.rol;
        }

        const asignaciones = await ProyectoUsuarioRepository.find({
            where,
            relations: ['usuario'],
        });

        const usuarios = asignaciones.map(a => ({
            id_usuario:       a.id_usuario,
            nombre:           a.usuario?.nombre,
            apellido:         a.usuario?.apellido,
            rut:              a.usuario?.rut,
            email:            a.usuario?.email,
            fecha_asignacion: a.fecha_asignacion,
            fecha_termino:    a.fecha_termino,
            activo:           a.activo,
        }));

        return [usuarios, null];
    } catch (error) {
        console.error('error en obtener usuarios del proyecto', error);
        return [null, error.message];
    }
};

export const asignarUsuarioAProyecto = async (idProyecto, data, ejecutor) => {
    try {
        const usuario = await UsuarioRepository.findOne({
            where: { id_usuario: data.id_usuario },
        });
        if (!usuario) throw new Error('usuario no encontrado');

        // BUG ORIGINAL: find() nunca devuelve null — siempre devuelve array.
        // Hay que usar findOne() y verificar si existe.
        const existe = await ProyectoUsuarioRepository.findOne({
            where: { id_proyecto: parseInt(idProyecto), id_usuario: data.id_usuario, activo: true },
        });
        if (existe) throw new Error('el usuario ya está asignado a este proyecto');

        const nuevaAsignacion = ProyectoUsuarioRepository.create({
            id_proyecto:      parseInt(idProyecto),
            id_usuario:       data.id_usuario, // BUG ORIGINAL: usaba variable 'id_usuario' no definida
            fecha_asignacion: new Date(),
            activo:           true,
        });

        const guardado = await ProyectoUsuarioRepository.save(nuevaAsignacion);

        const asignacionConUsuario = {
            ...guardado,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre:     usuario.nombre,
                apellido:   usuario.apellido,
                rut:        usuario.rut,
            },
        };

        return [asignacionConUsuario, null];
    } catch (error) {
        console.error('error en asignar usuario al proyecto', error);
        return [null, error.message];
    }
};

export const desvincularUsuarioDeProyecto = async (idProyecto, idUsuario, ejecutor) => {
    try {
        // Hay que usar findOne().
        const asignacion = await ProyectoUsuarioRepository.findOne({
            where: { id_proyecto: parseInt(idProyecto), id_usuario: parseInt(idUsuario), activo: true },
        });
        if (!asignacion) throw new Error('no se encontró la asignación del usuario en este proyecto');

        asignacion.activo       = false;
        asignacion.fecha_termino = new Date();
        await ProyectoUsuarioRepository.save(asignacion);

        return [{ message: 'usuario desvinculado con éxito' }, null];
    } catch (error) {
        return [null, error.message];
    }
};