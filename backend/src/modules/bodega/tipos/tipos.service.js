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

// 1. Imports
import jsonDbHandler from '../../../shared/jsonDbHandler.js';

const FOLDER = '../../data/bodega';
const FILE = 'tipo.json';

// 2. HELPER FUNCTIONS

const leerTodos = () => jsonDbHandler.leer(FOLDER, FILE);

const nuevoId = async () => {
    const lista = await leerTodos();
    if (lista.length === 0) return 1;
    return Math.max(...lista.map(t => t.id)) + 1;
};

const lanzarError = (mensaje, status) => {
    const error = new Error(mensaje);
    error.status = status;
    throw error;
};

//3. MAIN FUNCTIONS
// ################# CREAR #################
