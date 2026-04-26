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


