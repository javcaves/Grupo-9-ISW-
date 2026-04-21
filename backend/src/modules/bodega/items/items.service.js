/**
 * @file items.service.js
 * @description Lógica de negocio para el módulo de items de la bodega
 */

/**
 * @typedef {Object} Item
 * @property {number} id -identificador
 * @property {string} nombre -Nombre de item 
 * @property {number} id_tipo 
 * @property {number} stock_minimo -alerta si falta stock
 * @property {string} unidad_medida - bidon, caja etc
 * @property {boolean} activo -Soft delete
 */

//Imports
import jsonDbHandler from '../../../shared/jsonDbHandler.js';
//importamos el servicio de imventario para crear un registro inicial
import inventarioService from '../inventario/inventario.service.js';

const FOLDER = 'bodega';
const FILE = 'items.json';


 
 
 
