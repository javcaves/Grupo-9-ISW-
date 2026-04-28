/**
 * @file items.service.js
 * @description Lógica para el módulo de items de bodega
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

//1. IMPORTS
import jsonDbHandler from '../../../shared/jsonDbHandler.js';
//importamos el servicio de imventario para crear un registro inicial
import inventarioService from '../inventario/inventario.service.js';

const FOLDER = '../../data/bodega';
const FILE = 'items.json';
//2. HELPER FUNCTIONS
const leerTodos = () => jsonDbHandler.leer(FOLDER, FILE);

const nuevoId = async () => {
    const lista = await leerTodos();
    if (lista.length === 0) return 1;
    return Math.max(...lista.map(i => i.id)) + 1;
};

const lanzarError = (mensaje, status) => {
    const error = new Error(mensaje);
    error.status = status;
    throw error;
};

const validar = (data) => {
    if (!data.nombre || !data.id_tipo || !data.unidad_medida || data.stock_minimo == null)
        lanzarError("Campos obligatorios: nombre, id_tipo, stock_minimo, unidad_medida", 400);
    if (data.stock_minimo < 0)
        lanzarError("El stock mínimo debe ser un valor positivo", 400);
};
//3.MAIN FUNCTIONS

// ######### CREAR #########
const createItem = async (data) => {
    validar(data);

    const nuevoItem = {
        id: await nuevoId(),
        nombre: data.nombre,
        id_tipo: data.id_tipo,
        stock_minimo: data.stock_minimo,
        unidad_medida: data.unidad_medida,
        activo: true
    };

    const itemGuardado = await jsonDbHandler.guardar(FOLDER, FILE, nuevoItem);

    await inventarioService.createProducto({
        nombre: data.nombre,
        descripcion: 'Item creado automáticamente',
        cantidad: 0,
        precio: 0,
        categoria: data.id_tipo
    });

    return itemGuardado;
};
// ######### LEER #########
const getAll = async () => await leerTodos();

const getAllActivos = async () => {
    const lista = await leerTodos();
    return lista.filter(i => i.activo === true);
};

const getItemById = async (id) => {
    const lista = await leerTodos();
    return lista.find(i => i.id === id);
};

const getItemsByTipo = async (id_tipo) => {
    const lista = await leerTodos();
    return lista.filter(i => i.id_tipo === id_tipo && i.activo === true);
};


// ######### UPDATE #########
const updateItem = async (id, data) => {
    const lista = await leerTodos();
    const index = lista.findIndex(i => i.id === id);
    if (index === -1) lanzarError("Item no encontrado", 404);

    if (data.stock_minimo != null && data.stock_minimo < 0)
        lanzarError("El stock mínimo debe ser un valor no negativo", 400);

    lista[index] = {
        ...lista[index],
        nombre:        data.nombre        || lista[index].nombre,
        id_tipo:       data.id_tipo       || lista[index].id_tipo,
        stock_minimo:  data.stock_minimo  != null ? data.stock_minimo : lista[index].stock_minimo,
        unidad_medida: data.unidad_medida || lista[index].unidad_medida
    };

    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return lista[index];
};

// ######### ELIMINAR #########
const deleteItem = async (id) => {
    const lista = await leerTodos();
    const index = lista.findIndex(i => i.id === id);
    if (index === -1) lanzarError("Item no encontrado", 404);

    lista[index].activo = false;
    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return { message: "Item eliminado (soft delete)" };
};

const deleteItemHard = async (id) => {
    const lista = await leerTodos();
    const index = lista.findIndex(i => i.id === id);
    if (index === -1) lanzarError("Item no encontrado", 404);

    lista.splice(index, 1);
    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return { message: "Item eliminado definitivamente" };
};

//4. EXPORTS
module.exports = {
    createItem,
    getAll,
    getAllActivos,
    getItemById,
    getItemsByTipo,
    updateItem,
    deleteItem,
    deleteItemHard
};
 
 
 
