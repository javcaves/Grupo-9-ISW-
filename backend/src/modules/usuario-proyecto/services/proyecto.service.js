/**
 * @typedef {Object} Proyecto
 * @property {number} id_proyecto - Identificador único autoincremental
 * @property {string} nombre_proy - Nombre descriptivo del proyecto
 * @property {number} min_emp - Cantidad mínima de empleados requerida
 * @property {number} max_emp - Cantidad máxima de empleados permitida
 * @property {string} ubicacion - Dirección o geolocalización de la faena
 * @property {string} fecha_inicio - Fecha de inicio programada (ISO string)
 * @property {string} fecha_termino - Fecha de término estimada (ISO string)
 * @property {('EN_PREPARACION'|'EN_CURSO'|'FINALIZADO')} estado - Estado operativo del proyecto
 * @property {boolean} activo - Estado lógico para borrado suave (soft delete)
 */

/**
 * @typedef {Object} ProyectoUsuario
 * @property {number} id_proyecto - Referencia al ID del proyecto
 * @property {number} id_usuario - Referencia al ID del usuario (Encargado, Supervisor, Empleado)
 * @property {string} fecha_asignacion - Fecha en que se vinculó al proyecto (ISO string)
 * @property {string|null} fecha_termino - Fecha de desvinculación o finalización (ISO string o null)
 * @property {boolean} activo - Define si la vinculación está vigente actualmente
 */

import jsonDbHandler from '../../../shared/jsonDbHandler.js';

const dbProyecto = jsonDbHandler('recursos_humanos', 'proyecto.json');
const dbProyectoUsuario = jsonDbHandler('recursos_humanos', 'proyecto_usuario.json');
const dbUsuario = jsonDbHandler('recursos_humanos', 'usuario.json');

// --- HELPERS ---

/**
 * Valida si un empleado ya está en otro proyecto activo
 */
const validarDisponibilidadEmpleados = async (idsEmpleados) => {
    const vinculaciones = await dbProyectoUsuario.leer() || [];
    const proyectos = await dbProyecto.leer() || [];
    
    // Proyectos que están bloqueando personal
    const proyectosActivosIds = proyectos
        .filter(p => p.estado === "EN_CURSO" || p.estado === "EN_PREPARACION")
        .map(p => p.id_proyecto);

    for (const idEmp of idsEmpleados) {
        const estaOcupado = vinculaciones.some(v => 
            v.id_usuario === idEmp && 
            v.activo === true && 
            proyectosActivosIds.includes(v.id_proyecto)
        );
        if (estaOcupado) {
            throw { status: 400, message: `El usuario ID ${idEmp} ya está asignado a otro proyecto activo.` };
        }
    }
};

// --- MÉTODOS ---

/**
 * Crear Proyecto (Solo ADMIN/ROOT)
 */
export const crearProyecto = async (datos, ejecutor) => {
    if (!['ROOT', 'ADMIN'].includes(ejecutor.rol)) {
        throw { status: 403, message: "Solo administradores pueden crear proyectos." };
    }

    const { nombre, min_emp, max_emp, ubicacion, fecha_inicio, fecha_termino, encargados, empleados } = datos;

    // 1. Validar topes de personal
    const totalPersonal = encargados.length + empleados.length;
    if (totalPersonal > max_emp) throw { status: 400, message: "La cantidad de personal supera el máximo permitido." };
    if (totalPersonal < min_emp) throw { status: 400, message: "No cumple con el mínimo de empleados requerido." };

    // 2. Validar que no estén en otros proyectos
    await validarDisponibilidadEmpleados([...encargados, ...empleados]);

    const proyectos = await dbProyecto.leer() || [];
    const nuevoProyecto = {
        id_proyecto: proyectos.length > 0 ? Math.max(...proyectos.map(p => p.id_proyecto)) + 1 : 1,
        nombre,
        min_emp,
        max_emp,
        ubicacion,
        fecha_inicio,
        fecha_termino,
        estado: "EN_PREPARACION",
        activo: true
    };

    // 3. Guardar Proyecto y Vinculaciones
    await dbProyecto.escribir([...proyectos, nuevoProyecto]);
    
    const vinculaciones = await dbProyectoUsuario.leer() || [];
    const nuevasVinculaciones = [...encargados, ...empleados].map(id => ({
        id_proyecto: nuevoProyecto.id_proyecto,
        id_usuario: id,
        fecha_asignacion: new Date().toISOString(),
        fecha_termino: fecha_termino || null,
        activo: true
    }));

    await dbProyectoUsuario.escribir([...vinculaciones, ...nuevasVinculaciones]);
    return nuevoProyecto;
};

/**
 * Obtener proyectos según rol
 * Si es ADMIN ve todos. Si es ENCARGADO/SUPERVISOR solo los suyos.
 */
export const obtenerProyectosVinculados = async (usuario) => {
    const proyectos = await dbProyecto.leer() || [];
    
    if (['ROOT', 'ADMIN'].includes(usuario.rol)) {
        return proyectos.filter(p => p.activo);
    }

    const vinculaciones = await dbProyectoUsuario.leer() || [];
    const misProyectosIds = vinculaciones
        .filter(v => v.id_usuario === usuario.id && v.activo)
        .map(v => v.id_proyecto);

    return proyectos.filter(p => misProyectosIds.includes(p.id_proyecto) && p.activo);
};

/**
 * Editar Proyecto (Admin)
 */
export const editarProyecto = async (id_proyecto, datos, ejecutor) => {
    if (!['ROOT', 'ADMIN'].includes(ejecutor.rol)) {
        throw { status: 403, message: "Permiso denegado para editar proyectos." };
    }

    const proyectos = await dbProyecto.leer() || [];
    const index = proyectos.findIndex(p => p.id_proyecto === parseInt(id_proyecto));
    if (index === -1) throw { status: 404, message: "Proyecto no encontrado." };

    proyectos[index] = { ...proyectos[index], ...datos };
    await dbProyecto.escribir(proyectos);
    
    return proyectos[index];
};

/**
 * Obtener lista de personal de un proyecto (Para el Encargado)
 */
export const obtenerPersonalProyecto = async (id_proyecto) => {
    const vinculaciones = await dbProyectoUsuario.leer() || [];
    const usuarios = await dbUsuario.leer() || [];

    const idsPersonal = vinculaciones
        .filter(v => v.id_proyecto === parseInt(id_proyecto) && v.activo)
        .map(v => v.id_usuario);

    return usuarios
        .filter(u => idsPersonal.includes(u.id_usuario))
        .map(({ password, ...u }) => u); // Quitamos password por seguridad
};