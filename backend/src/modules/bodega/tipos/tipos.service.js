/**
 * @file tipos.service.js
 * @description gestion de tipo de productos 
 */

/**
 * @typedef {Object} Tipo
 * @property {number} id -identficador
 * @property {string} nombre 
 * @property {string} abreviatura - segun cuestionario prefijo para codigo de maquinaria 
 * @property {string} descripcion
 * @property {boolean} activo -estado para borrado logico
 */

// 1. IMPORTS
import jsonDbHandler from '../../../shared/jsonDbHandler.js';

const FOLDER = '../../data/bodega';
const FILE = 'tipo.json';

// 2. HELPER FUNCTIONS

export const leerTodos = () => jsonDbHandler.leer(FOLDER, FILE);

export const nuevoId = async () => {
    const lista = await leerTodos();
    if (lista.length === 0) return 1;
    return Math.max(...lista.map(t => t.id)) + 1;
};

export const lanzarError = (mensaje, status) => {
    const error = new Error(mensaje);
    error.status = status;
    throw error;
};

export const validarAbreviatura = (abreviatura) => {
    if (!/^[A-Za-z]{1,5}$/.test(abreviatura))
        lanzarError("Abreviatura: solo letras, máximo 5 caracteres", 400);
};

export const validarDuplicado = async (abreviatura, idActual = null) => {
    const lista = await leerTodos();
    const duplicado = lista.find(t =>
        t.abreviatura.toUpperCase() === abreviatura.toUpperCase() && t.id !== idActual
    );
    if (duplicado) lanzarError("Ya existe un tipo con esa abreviatura", 400);
};


//3. MAIN FUNCTIONS
// ################# CREAR #################

export const createTipo = async (data) => {
    if (!data.nombre || !data.abreviatura || !data.descripcion)
        lanzarError("Faltan campos: nombre, abreviatura, descripcion", 400);

    validarAbreviatura(data.abreviatura);
    await validarDuplicado(data.abreviatura);

    return await jsonDbHandler.guardar(FOLDER, FILE, {
        id: await nuevoId(),
        nombre: data.nombre,
        abreviatura: data.abreviatura.toUpperCase(),
        descripcion: data.descripcion,
        activo: true
    });
};


// ################# LEER  #################
export const getAll = async () => await leerTodos();

export const getAllActivos = async () => {
    const lista = await leerTodos();
    return lista.filter(t => t.activo === true);
};

export const getTipoById = async (id) => {
    const lista = await leerTodos();
    return lista.find(t => t.id === id);
};

// ################# ACTUALIZAR #################

export const updateTipo = async (id, data) => {
    const lista = await leerTodos();
    const index = lista.findIndex(t => t.id === id);
    if (index === -1) lanzarError("Tipo no encontrado", 404);

    if (data.abreviatura) {
        validarAbreviatura(data.abreviatura);
        await validarDuplicado(data.abreviatura, id);
    }

    lista[index] = {
        ...lista[index],
        nombre:      data.nombre      || lista[index].nombre,
        abreviatura: data.abreviatura ? data.abreviatura.toUpperCase() : lista[index].abreviatura,
        descripcion: data.descripcion || lista[index].descripcion
    };

    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return lista[index];
};

// ################# ELIMINAR #################
export const deleteTipo = async (id) => {
    const lista = await leerTodos();
    const index = lista.findIndex(t => t.id === id);
    if (index === -1) lanzarError("Tipo no encontrado", 404);

    lista[index].activo = false;
    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return { message: "Tipo eliminado (soft delete)" };
};

export const deleteTipoHard = async (id) => {
    const lista = await leerTodos();
    const index = lista.findIndex(t => t.id === id);
    if (index === -1) lanzarError("Tipo no encontrado", 404);

    lista.splice(index, 1);
    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return { message: "Tipo eliminado definitivamente" };
};