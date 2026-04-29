/**
 * @typedef {Object} asistencia
 * @property {number} id - Identificador único autoincremental
 * @property {string} fecha - Fecha de la asistencia (YYYY-MM-DD)
 * @property {string} nombre_evento - Nombre del turno o evento (ej. Turno Mañana)
 * @property {string} hora_entrada_esperada - Hora de entrada estándar
 * @property {string} estado_asistencia - Estado del registro (Abierta/Cerrada)
 * @property {string} observacion - Notas generales sobre la jornada
 * @property {boolean} activo - Estado del registro (Soft Delete)
 */


import jsonDbHandler from '../../../shared/jsonDbHandler.js';

const FOLDER = 'recursos_humanos';
const FILE_ASISTENCIA = 'asistencia.json';
const FILE_DETALLE = 'asistencia_empleado.json';


// ################# CREAR #################

/**
 * Crea una nueva jornada de asistencia
 */
export const crearAsistenciaGeneral = async (data) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE_ASISTENCIA);
    
    const existe = lista.find(a => a.fecha === data.fecha && a.nombre_evento === data.nombre_evento);
    if (existe) {
        const error = new Error(`Ya existe una asistencia registrada para ${data.nombre_evento} en la fecha ${data.fecha}`);
        error.status = 400;
        throw error;
    }

    const nuevoId = lista.length > 0 ? Math.max(...lista.map(a => a.id)) + 1 : 1;
    const nuevaAsistencia = {
        ...data,
        id: nuevoId,
        activo: true
    };

    lista.push(nuevaAsistencia);
    await jsonDbHandler.escribir(FOLDER, FILE_ASISTENCIA, lista);
    return nuevaAsistencia;
};

// ################# REGISTRO DE EMPLEADOS #################

/**
 * Registra la asistencia de un empleado específico vinculada a una cabecera
 */
export const registrarAsistenciaEmpleado = async (data) => {
    const listaDetalle = await jsonDbHandler.leer(FOLDER, FILE_DETALLE);
    
    // Verificar si ya tiene registro en esa asistencia
    const yaRegistrado = listaDetalle.find(d => 
        d.asistencia_id === parseInt(data.asistencia_id) && 
        d.empleado_id === parseInt(data.empleado_id)
    );

    if (yaRegistrado) {
        const error = new Error("El empleado ya tiene un registro de asistencia para este evento");
        error.status = 400;
        throw error;
    }

    const nuevoId = listaDetalle.length > 0 ? Math.max(...listaDetalle.map(d => d.id)) + 1 : 1;
    
    const nuevoRegistro = {
        ...data,
        id: nuevoId,
        asistencia_id: parseInt(data.asistencia_id),
        empleado_id: parseInt(data.empleado_id),
        activo: true
    };

    listaDetalle.push(nuevoRegistro);
    await jsonDbHandler.escribir(FOLDER, FILE_DETALLE, listaDetalle);
    return nuevoRegistro;
};

// ################# BUSQUEDAS #################

/**
 * Obtener todas las cabeceras de asistencia activas
 */
export const obtenerAsistenciasActivas = async () => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE_ASISTENCIA);
    return lista.filter(a => a.activo === true);
};

/**
 * Obtener el detalle de todos los empleados para una asistencia específica
 */
export const obtenerDetallePorAsistencia = async (asistenciaId) => {
    const listaDetalle = await jsonDbHandler.leer(FOLDER, FILE_DETALLE);
    return listaDetalle.filter(d => d.asistencia_id === parseInt(asistenciaId) && d.activo === true);
};

/**
 * Obtener una cabecera por ID
 */
export const obtenerAsistenciaPorID = async (id) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE_ASISTENCIA);
    const item = lista.find(a => a.id === parseInt(id));

    if (!item) {
        const error = new Error("Asistencia no encontrada");
        error.status = 404;
        throw error;
    }
    return item;
};

/**
 * Buscador Dinámico en registros de empleados: Filtra por Apellido o Correo
 */
export const buscarEmpleadoEnAsistencia = async (termino) => {
    const listaDetalle = await jsonDbHandler.leer(FOLDER, FILE_DETALLE);
    const t = termino.toLowerCase();

    return listaDetalle.filter(d => 
        d.apellido.toLowerCase().includes(t) || 
        d.correo.toLowerCase().includes(t)
    );
};

// ################# ACTUALIZAR #################

/**
 * Actualiza los datos de asistencia de un empleado (ej. agregar hora de salida o cambiar estado)
 */
export const actualizarAsistenciaEmpleado = async (id, data) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE_DETALLE);
    const index = lista.findIndex(d => d.id === parseInt(id));

    if (index === -1) {
        const error = new Error("No se encontró el registro de asistencia del empleado");
        error.status = 404;
        throw error;
    }

    const registroActualizado = {
        ...lista[index],
        ...data,
        id: lista[index].id,
        asistencia_id: lista[index].asistencia_id
    };

    lista[index] = registroActualizado;
    await jsonDbHandler.escribir(FOLDER, FILE_DETALLE, lista);
    return registroActualizado;
};

/**
 * Actualiza la cabecera
 */
export const actualizarCabeceraAsistencia = async (id, data) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE_ASISTENCIA);
    const index = lista.findIndex(a => a.id === parseInt(id));

    if (index === -1) {
        const error = new Error("No se encontró la cabecera de asistencia");
        error.status = 404;
        throw error;
    }

    lista[index] = { ...lista[index], ...data, id: lista[index].id };
    await jsonDbHandler.escribir(FOLDER, FILE_ASISTENCIA, lista);
    return lista[index];
};

// ################# ELIMINAR #################

/**
 * ELIMINACIÓN SOFT de una cabecera y (opcionalmente) sus detalles
 */
export const eliminarAsistenciaCompleta = async (id) => {
    // 1. Desactivar Cabecera
    let listaCabecera = await jsonDbHandler.leer(FOLDER, FILE_ASISTENCIA);
    listaCabecera = listaCabecera.map(a => a.id === parseInt(id) ? { ...a, activo: false } : a);
    await jsonDbHandler.escribir(FOLDER, FILE_ASISTENCIA, listaCabecera);

    // 2. Desactivar detalles asociados
    let listaDetalle = await jsonDbHandler.leer(FOLDER, FILE_DETALLE);
    listaDetalle = listaDetalle.map(d => d.asistencia_id === parseInt(id) ? { ...d, activo: false } : d);
    await jsonDbHandler.escribir(FOLDER, FILE_DETALLE, listaDetalle);

    return { message: "Asistencia y registros asociados desactivados" };
};

/**
 * ELIMINACIÓN HARD de un registro de empleado específico (por error de dedo)
 */
export const ELIMINAR_DETALLE_HARD = async (id) => {
    let lista = await jsonDbHandler.leer(FOLDER, FILE_DETALLE);
    const nuevaLista = lista.filter(d => d.id !== parseInt(id));
    await jsonDbHandler.escribir(FOLDER, FILE_DETALLE, nuevaLista);
    return { message: "Registro eliminado físicamente" };
};