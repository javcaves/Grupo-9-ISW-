
import { AppDataSource } from '../../config/ConfigDB.js';
import { ILike } from "typeorm";
import { v4 as uuidv4 } from 'uuid'; // Para generar tokens únicos

const dbAsistencia = jsonDbHandler('recursos_humanos', 'asistencia.json');
const dbAsisEmpleado = jsonDbHandler('recursos_humanos', 'asistencia_empleado.json');
const dbTurno = jsonDbHandler('recursos_humanos', 'turno.json');
const dbTurnoEmp = jsonDbHandler('recursos_humanos', 'turno_empleado.json');
const dbProyectoUser = jsonDbHandler('recursos_humanos', 'proyecto_usuario.json');

/**
 * Solo Encargado o Supervisor asignado al proyecto
 */
const validarPermisoGestion = async (idUsuario, idProyecto, cargo) => {
    const permitidos = ['SUPERVISOR', 'ENCARGADO'];
    if (!permitidos.includes(cargo)) throw { status: 403, message: "No tienes rango para gestionar asistencia." };

    const vinculos = await dbProyectoUser.leer() || [];
    const estaEnProyecto = vinculos.some(v => v.id_proyecto === parseInt(idProyecto) && v.id_usuario === parseInt(idUsuario) && v.activo);
    if (!estaEnProyecto) throw { status: 403, message: "No estás asignado a este proyecto." };
};

// ################# GESTIÓN DEL ENCARGADO #################

/**
 * 1. Generar Token/QR de Asistencia
 */
export const crearAsistencia = async (id_turno, ejecutor) => {
    const turnos = await dbTurno.leer() || [];
    const turno = turnos.find(t => t.id_turno === parseInt(id_turno) && t.activo);
    if (!turno) throw { status: 404, message: "Turno no encontrado." };

    await validarPermisoGestion(ejecutor.id, turno.id_proyecto, ejecutor.cargo);

    const fechaHoy = new Date().toISOString().split('T')[0];
    const asistencias = await dbAsistencia.leer() || [];

    // Regla: Solo una asistencia por turno al día
    const existe = asistencias.find(a => a.id_turno === id_turno && a.fecha === fechaHoy && a.activo);
    if (existe) throw { status: 400, message: "La asistencia para este turno ya fue generada hoy." };

    const nuevaAsistencia = {
        id_asistencia: Date.now(),
        id_proyecto: turno.id_proyecto,
        id_turno: parseInt(id_turno),
        fecha: fechaHoy,
        token: uuidv4().substring(0, 6).toUpperCase(), // Token corto de 6 caracteres
        activo: true
    };

    // Al crear la asistencia, inicializamos a todos los empleados del turno en "EN_ESPERA"
    const asignacionesTurno = await dbTurnoEmp.leer() || [];
    const empleadosDelTurno = asignacionesTurno.filter(at => at.id_turno === id_turno && at.activo);

    const detallesIniciales = empleadosDelTurno.map(emp => ({
        id_asistencia: nuevaAsistencia.id_asistencia,
        id_empleado: emp.id_empleado,
        hora_ingreso: null,
        estado: "EN_ESPERA",
        descripcion: "",
        activo: true
    }));

    await dbAsistencia.escribir([...asistencias, nuevaAsistencia]);
    const asisDetalles = await dbAsisEmpleado.leer() || [];
    await dbAsisEmpleado.escribir([...asisDetalles, ...detallesIniciales]);

    return nuevaAsistencia;
};

/**
 * 2 & 3. Ver y Editar Detalle (Encargado/Supervisor)
 */
export const actualizarEstadoManual = async (idAsistencia, idEmpleado, data, ejecutor) => {
    const cabecera = (await dbAsistencia.leer()).find(a => a.id_asistencia === parseInt(idAsistencia));
    await validarPermisoGestion(ejecutor.id, cabecera.id_proyecto, ejecutor.cargo);

    const detalles = await dbAsisEmpleado.leer() || [];
    const index = detalles.findIndex(d => d.id_asistencia === parseInt(idAsistencia) && d.id_empleado === parseInt(idEmpleado));

    if (index === -1) throw { status: 404, message: "Registro de empleado no encontrado." };

    detalles[index] = { ...detalles[index], ...data }; // data puede traer estado, descripcion, hora_ingreso
    await dbAsisEmpleado.escribir(detalles);
    return detalles[index];
};

/**
 * 4. Eliminar Asistencia
 */
export const eliminarAsistencia = async (idAsistencia, ejecutor) => {
    const asistencias = await dbAsistencia.leer() || [];
    const asisIdx = asistencias.findIndex(a => a.id_asistencia === parseInt(idAsistencia));
    if (asisIdx === -1) throw { status: 404, message: "Asistencia no encontrada." };

    await validarPermisoGestion(ejecutor.id, asistencias[asisIdx].id_proyecto, ejecutor.cargo);

    const detalles = await dbAsisEmpleado.leer() || [];
    const misDetalles = detalles.filter(d => d.id_asistencia === parseInt(idAsistencia));

    // Regla: No eliminar si hay alguien que no esté "EN ESPERA" o "FALTA_INJUSTIFICADA"
    const hayRegistrosActivos = misDetalles.some(d => !["EN_ESPERA", "FALTA_INJUSTIFICADA"].includes(d.estado));
    if (hayRegistrosActivos) {
        throw { status: 400, message: "No puedes eliminar una asistencia con personal ya marcado como ASISTIDO o ATRASO." };
    }

    asistencias[asisIdx].activo = false;
    await dbAsistencia.escribir(asistencias);
    return { message: "Asistencia eliminada." };
};

// ################# LÓGICA DEL EMPLEADO #################

/**
 * 6. Registrar Asistencia (Auto-marcado por el empleado)
 */
export const registrarMarcaEmpleado = async (token, idEmpleado) => {
    const asistencias = await dbAsistencia.leer() || [];
    const asistencia = asistencias.find(a => a.token === token.toUpperCase() && a.activo);
    if (!asistencia) throw { status: 404, message: "Token inválido o expirado." };

    // Verificar que el empleado pertenezca a esta asistencia (esté en el turno)
    const detalles = await dbAsisEmpleado.leer() || [];
    const detalleIdx = detalles.findIndex(d => d.id_asistencia === asistencia.id_asistencia && d.id_empleado === parseInt(idEmpleado));
    
    if (detalleIdx === -1) throw { status: 403, message: "No estás vinculado a este turno de asistencia." };
    if (detalles[detalleIdx].estado !== "EN_ESPERA") throw { status: 400, message: "Ya posees un registro de asistencia para este turno." };

    // Validar fin del turno
    const turno = (await dbTurno.leer()).find(t => t.id_turno === asistencia.id_turno);
    const ahora = new Date();
    const horaActualStr = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');

    if (horaActualStr > turno.hora_salida) {
        throw { status: 403, message: "El turno ya ha finalizado. No puedes marcar asistencia." };
    }

    // Calcular Estado (Margen de 15 minutos para ser "ASISTIDO", sino "ATRASO")
    // Aquí comparamos horaActualStr vs turno.hora_ingreso
    let estadoFinal = "ASISTIDO";
    if (horaActualStr > turno.hora_ingreso) {
        estadoFinal = "ATRASO";
    }

    detalles[detalleIdx].hora_ingreso = horaActualStr;
    detalles[detalleIdx].estado = estadoFinal;

    await dbAsisEmpleado.escribir(detalles);
    return detalles[detalleIdx];
};

// ################# HISTORIAL Y REPORTES #################

export const obtenerHistorial = async (filtros) => {
    const cabeceras = await dbAsistencia.leer() || [];
    // Ordenar por fecha descendente
    return cabeceras.filter(a => a.activo).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};

export const obtenerDetalleAsistencia = async (idAsistencia) => {
    const detalles = await dbAsisEmpleado.leer() || [];
    return detalles.filter(d => d.id_asistencia === parseInt(idAsistencia) && d.activo);
};