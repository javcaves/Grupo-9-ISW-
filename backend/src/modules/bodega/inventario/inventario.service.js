/**
 * @typedef {Object} Inventario
 * @property {number} id - Identificador único autoincremental
 * @property {string} nombre - Nombre del producto en el inventario
 * @property {string} descripcion - Descripción detallada del producto
 * @property {number} cantidad - Cantidad disponible del producto en el inventario
 * @property {number} precio - Precio unitario del producto
 * @property {string} categoria - Categoría a la que pertenece el producto
 * @property {boolean} activo - Estado del producto en el inventario (Soft Delete)
**/

import jsonDbHandler from '../../../shared/jsonDbHandler.js';

const FOLDER = 'bodega';
const FILE = 'inventario.json';

// ################# CREAR #################
export const crearProducto = async (data) => {
    return await _procesarGuardado(data);
};

// ################# BUSQUEDA #################

/**
 * Obtener todos los productos del inventario
 */
export const obtenerTodos = async () => {
    return await jsonDbHandler.leer(FOLDER, FILE);
};

/**
 * Obtener solo productos activos
 */
export const obtenerTodosActivos = async () => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista.filter(p => p.activo === true);
};

// ################# FUNCIONES AUXILIARES #################

const _procesarGuardado = async (data) => {
    // Validar campos obligatorios
    if (!data.nombre || !data.descripcion || data.cantidad == null || data.precio == null || !data.categoria) {
        const error = new Error("Faltan campos obligatorios: nombre, descripcion, cantidad, precio, categoria");
        error.status = 400;
        throw error;
    }

    // Validar cantidad y precio
    if (data.cantidad < 0 || data.precio < 0) {
        const error = new Error("Cantidad y precio deben ser valores no negativos");
        error.status = 400;
        throw error;
    }

    // Crear nuevo producto
    const nuevoProducto = {
        id: await _obtenerNuevoId(),
        nombre: data.nombre,
        descripcion: data.descripcion,
        cantidad: data.cantidad,
        precio: data.precio,
        categoria: data.categoria,
        activo: true
    };

    // Guardar en la base de datos
    return await jsonDbHandler.guardar(FOLDER, FILE, nuevoProducto);
};

const _obtenerNuevoId = async () => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    if (lista.length === 0) return 1;
    return Math.max(...lista.map(p => p.id)) + 1;
};

// ################# ACTUALIZAR #################
export const actualizarProducto = async (id, data) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const index = lista.findIndex(p => p.id === id);

    if (index === -1) {
        const error = new Error("Producto no encontrado");
        error.status = 404;
        throw error;
    }

    // Actualizar campos permitidos
    const productoExistente = lista[index];
    const productoActualizado = {
        ...productoExistente,
        nombre: data.nombre || productoExistente.nombre,
        descripcion: data.descripcion || productoExistente.descripcion,
        cantidad: data.cantidad != null ? data.cantidad : productoExistente.cantidad,
        precio: data.precio != null ? data.precio : productoExistente.precio,
        categoria: data.categoria || productoExistente.categoria
    };

    // Validar cantidad y precio si se están actualizando
    if (data.cantidad != null && data.cantidad < 0) {
        const error = new Error("Cantidad debe ser un valor no negativo");
        error.status = 400;
        throw error;
    }
    if (data.precio != null && data.precio < 0) {
        const error = new Error("Precio debe ser un valor no negativo");
        error.status = 400;
        throw error;
    }

    lista[index] = productoActualizado;
    await jsonDbHandler.escribir(FOLDER, FILE, lista);

    return productoActualizado;
};

// ################# ELIMINAR (Soft Delete) #################
export const eliminarProducto = async (id) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const index = lista.findIndex(p => p.id === id);

    if (index === -1) {
        const error = new Error("Producto no encontrado");
        error.status = 404;
        throw error;
    }

    lista[index].activo = false; // Soft delete
    await jsonDbHandler.escribir(FOLDER, FILE, lista);

    return { message: "Producto eliminado (soft delete)" };
};

