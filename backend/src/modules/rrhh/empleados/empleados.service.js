/**
 * @typedef {Object} Empleado
 * @property {number} id - Identificador único autoincremental
 * @property {string} rut - RUT normalizado (sin puntos, con guion y Mayúscula)
 * @property {string} nombre - Nombres del empleado
 * @property {string} apellido - Apellidos del empleado
 * @property {string} observacion - Observacion sobre el empleado
 * @property {string} correo - Email vinculado
 * @property {string} cargo - Rol en la empresa
 * @property {date} fecha_ingreso - Fecha de ingreso a la empresa
 * @property {number} numero - Número de contacto
 * @property {boolean} activo - Estado de la cuenta (Soft Delete)
 */

import jsonDbHandler from '../../../shared/jsonDbHandler.js';

const FOLDER = 'recursos_humanos';
const FILE = 'empleados.json';
const CARGOS_PERMITIDOS = ['Administrativo', 'Operativo'];

// ################# CREAR #################
export const crearEmpleado = async (data) => {
    const yaExiste = await existeEmpleado(data.rut, 'Operativo');
    
    if (yaExiste) {
        const error = new Error("El trabajador ya está registrado como Operativo");
        error.status = 400;
        throw error;
    }

    return await _procesarGuardado(data, 'Operativo');
};

export const crearAdmin = async (data) => {
    const yaExiste = await existeEmpleado(data.rut, 'Administrativo');
    
    if (yaExiste) {
        const error = new Error("El trabajador ya está registrado como Administrativo");
        error.status = 400;
        throw error;
    }

    return await _procesarGuardado(data, 'Administrativo');
};

// ################# BUSQUEDA #################

/**
 * Obtener todos los empleados y admins
 */
export const obtenerTodos = async () => {
    return await jsonDbHandler.leer(FOLDER, FILE);
};

/**
 * Obtener solo empleados activos
 */
export const obtenerTodosActivos = async () => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista.filter(e => e.activo === true);
};

/**
 * Obtener solo empleados activos del cargo correspondiente
 * @param {string} cargo - cargo a buscar
 */
export const obtenerActivosPorCargo = async (cargo) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista.filter(e => e.activo === true && e.cargo === cargo);
};

/**
 * Obtener un registro único por su ID
 */
export const obtenerPorID = async (id) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const empleado = lista.find(e => e.id === parseInt(id));

    if (!empleado) {
        const error = new Error("Registro no encontrado");
        error.status = 404;
        throw error;
    }

    return empleado;
};

/**
 * Obtener un registro por RUT y Cargo
 * Por defecto: Operativo
 */
export const obtenerPorRutYCargo = async (rut, cargo) => {
    const cargoFinal = cargo || 'Operativo';
    const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    
    return lista.find(e => e.rut === rutLimpio && e.cargo === cargoFinal);
};

/**
 * Buscador Dinámico: Filtra por Nombre, Apellido o RUT
 */
export const buscarDinamico = async (termino) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const t = termino.toLowerCase();

    return lista.filter(e => {
        // Concatenamos los campos para buscar en "todo el texto" del registro
        const nombreCompleto = `${e.nombre} ${e.apellido}`.toLowerCase();
        const rut = e.rut.toLowerCase();
        
        return nombreCompleto.includes(t) || rut.includes(t);
    });
};

// #################### ACTUALIZAR ####################

/**
 * Actualiza un registro existente por su ID
 * @param {number|string} id - ID del registro a editar
 * @param {Object} data - Objeto con los nuevos campos (nombre, apellido, etc.)
 */
export const actualizar = async (id, data) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const index = lista.findIndex(e => e.id === parseInt(id));

    if (index === -1) {
        const error = new Error("No se encontró el registro para actualizar");
        error.status = 404;
        throw error;
    }

    const registroActualizado = {
        ...lista[index],
        ...data,
        id: lista[index].id,
        cargo: lista[index].cargo
    };

    if (data.rut) {
        registroActualizado.rut = data.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    }

    lista[index] = registroActualizado;
    await jsonDbHandler.escribir(FOLDER, FILE, lista);

    return registroActualizado;
};


// #################### ELIMINAR ####################

/**
 * ELIMINACIÓN SOFT (Desactivación lógica)
 * Puede recibir: { id }, { rut, cargo }, { cargo } o nada (para todos)
 */
export const eliminar = async (criterio = {}) => {
    let lista = await jsonDbHandler.leer(FOLDER, FILE);
    const { id, rut, cargo } = criterio;

    lista = lista.map(e => {
        let match = false;

        if (id) match = e.id === parseInt(id);
        else if (rut && cargo) {
            const rLimpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
            match = e.rut === rLimpio && e.cargo === cargo;
        } 
        else if (cargo) match = e.cargo === cargo;
        else match = true;

        return match ? { ...e, activo: false } : e;
    });

    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return { message: "Desactivación completada con éxito" };
};

/**
 * ELIMINACIÓN HARD (Borrado físico del JSON)
 * Adecuado para limpiar errores de ingreso o pruebas
 */
export const ELIMINARHARD = async (criterio = {}) => {
    let lista = await jsonDbHandler.leer(FOLDER, FILE);
    const { id, rut, cargo } = criterio;

    const nuevaLista = lista.filter(e => {
        if (id) return e.id !== parseInt(id);
        
        if (rut && cargo) {
            const rLimpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
            return !(e.rut === rLimpio && e.cargo === cargo);
        }

        if (cargo) return e.cargo !== cargo;

        return false;
    });

    await jsonDbHandler.escribir(FOLDER, FILE, nuevaLista);
    return { message: "Eliminación física completada" };
};

// ################# VALIDACIONES #################
export const existeEmpleado = async (rut, cargo) => {
    const cargoFinal = cargo || 'Operativo'; 
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    
    const rutFormateado = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    
    return lista.some(e => e.rut === rutFormateado && e.cargo === cargoFinal);
};

// ################# HELPERS #################

/**
 * Helper para procesar el ID, RUT y persistencia
 */
const _procesarGuardado = async (data, cargo) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    
    const nuevoId = lista.length > 0 ? Math.max(...lista.map(e => e.id)) + 1 : 1;
    
    const rutLimpio = data.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();

    const nuevoRegistro = { 
        ...data, 
        id: nuevoId, 
        rut: rutLimpio, 
        cargo: cargo, 
        activo: true 
    };

    lista.push(nuevoRegistro);
    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    
    return nuevoRegistro;
};

