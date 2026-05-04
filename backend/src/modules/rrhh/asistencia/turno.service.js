/**
 * @typedef {Object} Turno
 * @property {number} id_turno - Identificador único
 * @property {number} id_proyecto - Proyecto al que pertenece el turno
 * @property {string} hora_ingreso - HH:mm
 * @property {string} hora_salida - HH:mm
 * @property {string} descripcion - Nombre o detalle del turno
 * @property {boolean} activo - Soft delete
 */

/**
 * @typedef {Object} TurnoEmpleado
 * @property {number} id_turno - ID del turno
 * @property {number} id_empleado - ID del usuario (rol empleado)
 * @property {string} fecha_ingreso - Fecha inicio asignación (ISO)
 * @property {string} fecha_egreso - Fecha fin asignación o null
 * @property {boolean} activo - Estado de la vinculación
 */

import jsonDbHandler from '../../shared/jsonDbHandler.js';

const dbTurno = jsonDbHandler('recursos_humanos', 'turno.json');
const dbTurnoEmpleado = jsonDbHandler('recursos_humanos', 'turno_empleado.json');
const dbProyectoUsuario = jsonDbHandler('recursos_humanos', 'proyecto_usuario.json');

// --- HELPERS DE VALIDACIÓN ---

/**
 * Verifica si un usuario tiene permisos de gestión en el proyecto.
 * Regla: Solo SUPERVISOR o ENCARGADO vinculados al proyecto pueden modificar.
 */
const validarPermisoGestionProyecto = async (idUsuario, idProyecto, cargo) => {
    const rolesPermitidos = ['SUPERVISOR', 'ENCARGADO'];
    if (!rolesPermitidos.includes(cargo)) {
        throw { status: 403, message: "No tienes permisos de jerarquía para modificar turnos." };
    }

    const vinculaciones = await dbProyectoUsuario.leer() || [];
    const estaVinculado = vinculaciones.some(rel => 
        rel.id_proyecto === parseInt(idProyecto) && 
        rel.id_usuario === parseInt(idUsuario) && 
        rel.activo === true
    );

    if (!estaVinculado) {
        throw { status: 403, message: "No estás asignado formalmente a este proyecto para gestionarlo." };
    }
};

/**
 * Valida si la hora actual está dentro del rango del turno.
 * Soporta turnos que cruzan la medianoche (ej: 22:00 a 06:00).
 */
const estaEnRangoHorario = (inicio, fin) => {
    const ahora = new Date();
    const actual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
    
    if (inicio <= fin) {
        return actual >= inicio && actual <= fin;
    } else {
        // Caso turno nocturno
        return actual >= inicio || actual <= fin;
    }
};

// --- MÉTODOS DEL SERVICIO ---

/**
 * Crear un nuevo turno dentro de un proyecto
 */
export const crearTurno = async (datosTurno, ejecutor) => {
    const { id_proyecto, hora_ingreso, hora_salida, descripcion } = datosTurno;

    await validarPermisoGestionProyecto(ejecutor.id, id_proyecto, ejecutor.cargo);

    const turnos = await dbTurno.leer() || [];
    
    const coincidencia = turnos.find(t => 
        t.id_proyecto === id_proyecto && 
        t.hora_ingreso === hora_ingreso && 
        t.hora_salida === hora_salida &&
        t.activo === true
    );

    if (coincidencia) {
        throw { status: 400, message: "Ya existe un turno idéntico activo en este proyecto." };
    }

    const nuevoTurno = {
        id_turno: turnos.length > 0 ? Math.max(...turnos.map(t => t.id_turno)) + 1 : 1,
        id_proyecto,
        hora_ingreso,
        hora_salida,
        descripcion,
        activo: true
    };

    await dbTurno.escribir([...turnos, nuevoTurno]);
    return nuevoTurno;
};

/**
 * Asignar empleados a un turno específico
 */
export const asignarEmpleadosATurno = async (id_turno, empleadosNuevos, ejecutor) => {
    const turnos = await dbTurno.leer() || [];
    const turno = turnos.find(t => t.id_turno === parseInt(id_turno));
    
    if (!turno || !turno.activo) throw { status: 404, message: "Turno no encontrado." };

    await validarPermisoGestionProyecto(ejecutor.id, turno.id_proyecto, ejecutor.cargo);

    const asignaciones = await dbTurnoEmpleado.leer() || [];
    const vinculacionesProyecto = await dbProyectoUsuario.leer() || [];

    for (const data of empleadosNuevos) {
        const { id_empleado, fecha_ingreso, fecha_egreso } = data;

        // 1. El empleado debe pertenecer al proyecto
        const enProyecto = vinculacionesProyecto.some(rel => 
            rel.id_proyecto === turno.id_proyecto && 
            rel.id_usuario === id_empleado && 
            rel.activo === true
        );

        if (!enProyecto) {
            throw { status: 403, message: `El empleado ID ${id_empleado} no pertenece a este proyecto.` };
        }

        // 2. No puede tener otro turno activo en el mismo proyecto
        const yaTieneTurno = asignaciones.some(asig => 
            asig.id_empleado === id_empleado && 
            asig.activo === true &&
            turnos.some(t => t.id_turno === asig.id_turno && t.id_proyecto === turno.id_proyecto && t.activo === true)
        );

        if (yaTieneTurno) {
            throw { status: 400, message: `El empleado ${id_empleado} ya tiene una asignación activa en este proyecto.` };
        }

        asignaciones.push({
            id_asignacion: Date.now() + Math.floor(Math.random() * 1000),
            id_turno: parseInt(id_turno),
            id_empleado,
            fecha_ingreso,
            fecha_egreso: fecha_egreso || null,
            activo: true
        });
    }

    await dbTurnoEmpleado.escribir(asignaciones);
    return { success: true };
};

/**
 * Desvincular un empleado del turno (Regla de horario activa)
 */
export const eliminarEmpleadoDeTurno = async (id_turno, id_empleado, ejecutor) => {
    const turnos = await dbTurno.leer() || [];
    const turno = turnos.find(t => t.id_turno === parseInt(id_turno));
    if (!turno) throw { status: 404, message: "Turno no existe." };

    await validarPermisoGestionProyecto(ejecutor.id, turno.id_proyecto, ejecutor.cargo);

    // REGLA: Fuera del horario del turno
    if (estaEnRangoHorario(turno.hora_ingreso, turno.hora_salida)) {
        throw { status: 403, message: "Restricción: No puedes desvincular personal mientras el turno está en curso." };
    }

    const asignaciones = await dbTurnoEmpleado.leer() || [];
    const index = asignaciones.findIndex(a => 
        a.id_turno === parseInt(id_turno) && 
        a.id_empleado === parseInt(id_empleado) && 
        a.activo === true
    );

    if (index === -1) throw { status: 404, message: "Asignación no encontrada." };

    asignaciones[index].activo = false;
    await dbTurnoEmpleado.escribir(asignaciones);
    return { message: "Empleado desvinculado con éxito." };
};

/**
 * Eliminar el turno completo (Solo si no tiene empleados)
 */
export const eliminarTurno = async (id_turno, ejecutor) => {
    const turnos = await dbTurno.leer() || [];
    const index = turnos.findIndex(t => t.id_turno === parseInt(id_turno));
    
    if (index === -1) throw { status: 404, message: "Turno no encontrado." };

    await validarPermisoGestionProyecto(ejecutor.id, turnos[index].id_proyecto, ejecutor.cargo);

    const asignaciones = await dbTurnoEmpleado.leer() || [];
    const tienePersonal = asignaciones.some(a => a.id_turno === parseInt(id_turno) && a.activo === true);

    if (tienePersonal) {
        throw { status: 400, message: "No se puede eliminar un turno con personal asignado. Vacíalo primero." };
    }

    turnos[index].activo = false;
    await dbTurno.escribir(turnos);
    return { message: "Turno desactivado." };
};

/**
 * Obtener turnos de un proyecto con métricas básicas
 */
export const obtenerTurnosPorProyecto = async (idProyecto) => {
    const turnos = await dbTurno.leer() || [];
    const asignaciones = await dbTurnoEmpleado.leer() || [];

    return turnos
        .filter(t => t.id_proyecto === parseInt(idProyecto) && t.activo === true)
        .map(t => ({
            ...t,
            cantidad_empleados: asignaciones.filter(a => a.id_turno === t.id_turno && a.activo).length
        }));
};