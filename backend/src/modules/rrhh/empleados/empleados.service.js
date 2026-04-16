import jsonDbHandler from '../../../shared/jsonDbHandler.js';
import { esRutValido } from '../../../shared/validators.js';

const FOLDER = 'rrhh';
const FILE = 'empleados.json';

// #################### FUNCIONES CREAR ####################
export const crear = async (data) => {
    if (esRutValido(data.rut)){
        const error = new Error("El formato del RUT no es válido.");
        error.status = 400;
        throw error;
    }
    const empleadoExistente = await obtenerPorRut(data.rut);
    if(empleadoExistente){
        const error = new Error("Ya existe un empleado con este RUT.");
        error.status = 400;
        throw error;
    }

    const empleados = await jsonDbHandler.leer(FOLDER, FILE);
    const nuevoId = empleados.length > 0 ? Math.max(...empleados.map(e => e.id)) + 1 : 1;
    const rutNormalizado = data.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    const nuevoEmpleado = { 
        ...data, 
        id: nuevoId, 
        rut: rutNormalizado,
        activo: true
    };

    empleados.push(nuevoEmpleado);
    await jsonDbHandler.escribir(FOLDER, FILE, empleados);
    return nuevoEmpleado;
};

// #################### FUNCIONES OBTENER ####################
/**
 * Obtener todos los empleados
 */
export const obtenerTodos = async () => {
    return await jsonDbHandler.leer(FOLDER, FILE);
};

/**
 * Obtener todos los empleados activos
 */
export const obtenerActivos = async () => {
    const empleados = await jsonDbHandler.leer(FOLDER, FILE);
    return empleados.filter(empleado => empleado.activo === true);
};

/**
 * Obtener empleado dado una id
 * @param {integer} id
 */
export const obtenerPorID = async (id) => {
    let empleados = await jsonDbHandler.leer(FOLDER, FILE);
    const empleado = empleados.find(e => e.id === parseInt(id));

    if (!empleado){
        const error = new Error ("Empleado no encontrado");
        error.status = 404;
        throw error;
    }

    return empleado[index];
}

/**
 * Obtener un empleado por su RUT
 * @param {string} rut
 */
export const obtenerPorRut = async (rut) => {
    const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    
    const empleados = await jsonDbHandler.read(FOLDER, FILE);
    
    // Buscamos y retornamos (devuelve el objeto o undefined)
    return empleados.find(e => e.rut === rutLimpio);
};



// #################### FUNCIONES ACTUALIZAR ####################
export const actualizar = async (id, data) => {
    let empleados = await jsonDbHandler.leer(FOLDER, FILE);
    const index = empleados.findIndex(e => e.id === parseInt(id));

    if (index === -1) {
        const error = new Error("Empleado no encontrado para actualizar");
        error.status = 404;
        throw error;
    }

    empleados[index] = { ...empleados[index], ...data, id: parseInt(id) };
    
    await jsonDbHandler.escribir(FOLDER, FILE, empleados);
    return empleados[index];
};



// #################### FUNCIONES ELIMINAR (SOFT) ####################
export const eliminar = async (id) => {
    let empleados = await jsonDbHandler.leer(FOLDER, FILE);
    const index = empleados.findIndex(e => e.id === parseInt(id));

    if (index === -1) {
        const error = new Error("Empleado no encontrado");
        error.status = 404;
        throw error;
    }

    empleados[index].activo = false;

    await jsonDbHandler.escribir(FOLDER, FILE, empleados);
    return { message: "Empleado desactivado correctamente" };
};

// #################### FUNCIONES ELIMINAR ####################
export const eliminarHARD = async (id) => {
    let empleados = await jsonDbHandler.leer(FOLDER, FILE);
    const inicialLength = empleados.length;

    const nuevosEmpleados = empleados.filter(e => e.id !== parseInt(id));

    if (nuevosEmpleados.length === inicialLength) {
        const error = new Error("No se encontró el ID para eliminación física");
        error.status = 404;
        throw error;
    }

    await jsonDbHandler.escribir(FOLDER, FILE, nuevosEmpleados);
    return { message: "Empleado borrado permanentemente del registro" };
};

// #################### FUNCIONES BUSCADOR ####################
export const buscarDinamico = async (termino) => {
    const empleados = await jsonDbHandler.leer(FOLDER, FILE);
    const t = termino.toLowerCase();

    return empleados.filter(e => {
        const infoCompleta = `${e.nombre} ${e.apellido} ${e.rut}`.toLowerCase();
        return infoCompleta.includes(t);
    });
};
