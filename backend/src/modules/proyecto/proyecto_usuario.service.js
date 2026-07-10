/**
 * @typedef {Object} ProyectoUsuario
 * @property {number} id_proyecto - Referencia al ID del proyecto
 * @property {number} id_usuario - Referencia al ID del usuario (Encargado, Supervisor, Empleado)
 * @property {string} fecha_asignacion - Fecha en que se vinculó al proyecto (ISO string)
 * @property {string|null} fecha_termino - Fecha de desvinculación o finalización (ISO string o null)
 * @property {boolean} activo - Define si la vinculación está vigente actualmente
 */
import { AppDataSource } from '../../config/ConfigDB.js';
import { ROLES_PROYECTO } from './proyecto_usuario.validations.js';

const ProyectoUsuarioRepository = AppDataSource.getRepository('ProyectoUsuario');
const UsuarioRepository          = AppDataSource.getRepository('Usuario');

export const obtenerUsuariosDelProyecto = async (idProyecto, filtros = {}) => {
  try {
    // FIX: antes se filtraba por "rol_proyecto" en el WHERE de ProyectoUsuario,
    // una columna que "asignarUsuarioAProyecto" nunca llenaba (siempre quedaba
    // null), así que el filtro nunca encontraba nada. El rol de una persona
    // es su rol GLOBAL (Usuario.rol) — se filtra en memoria tras el join.
    const asignaciones = await ProyectoUsuarioRepository.find({
      where: { id_proyecto: parseInt(idProyecto), activo: true },
      relations: { usuario: true },
    });

    const filtradas = filtros.rolproyecto
      ? asignaciones.filter((a) => a.usuario?.rol === filtros.rolproyecto)
      : asignaciones;

    const usuarios = filtradas.map(a => ({
      id_usuario:       a.id_usuario,
      nombre:           a.usuario?.nombre,
      apellido:         a.usuario?.apellido,
      rut:              a.usuario?.rut,
      email:            a.usuario?.email,
      rol:              a.usuario?.rol,
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

    // Solo se puede vincular a alguien cuyo rol global sea de proyecto
    // (evita vincular por error una cuenta ROOT/ADMIN/SIN_ASIG).
    if (!ROLES_PROYECTO.includes(usuario.rol)) {
      throw new Error(`solo se pueden vincular usuarios con rol ${ROLES_PROYECTO.join(', ')}`);
    }

    // Un ENCARGADO solo puede vincular personal con rol EMPLEADO a su proyecto.
    if (ejecutor.rol === 'ENCARGADO' && usuario.rol !== 'EMPLEADO') {
      throw new Error('como encargado solo puedes vincular personal con rol EMPLEADO');
    }

    const existe = await ProyectoUsuarioRepository.findOne({
      where: { id_proyecto: parseInt(idProyecto), id_usuario: data.id_usuario, activo: true },
    });
    if (existe) throw new Error('el usuario ya está asignado a este proyecto');

    const nuevaAsignacion = ProyectoUsuarioRepository.create({
      id_proyecto:      parseInt(idProyecto),
      id_usuario:       data.id_usuario,
      fecha_asignacion: new Date(),
      activo:           true,
    });

    const guardado = await ProyectoUsuarioRepository.save(nuevaAsignacion);

    return [{
      ...guardado,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre:     usuario.nombre,
        apellido:   usuario.apellido,
        rut:        usuario.rut,
        rol:        usuario.rol,
      },
    }, null];
  } catch (error) {
    console.error('error en asignar usuario al proyecto', error);
    return [null, error.message];
  }
};

export const desvincularUsuarioDeProyecto = async (idProyecto, idUsuario, ejecutor) => {
  try {
    const asignacion = await ProyectoUsuarioRepository.findOne({
      where: { id_proyecto: parseInt(idProyecto), id_usuario: parseInt(idUsuario), activo: true },
    });
    if (!asignacion) throw new Error('no se encontró la asignación del usuario en este proyecto');

    asignacion.activo        = false;
    asignacion.fecha_termino = new Date();
    await ProyectoUsuarioRepository.save(asignacion);

    return [{ message: 'usuario desvinculado con éxito' }, null];
  } catch (error) {
    return [null, error.message];
  }
};