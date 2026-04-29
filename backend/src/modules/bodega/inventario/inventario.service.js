/**
 * @file inventario.service.js
 * @description Lógica de negocio para el módulo de inventario de la bodega
 */

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

// 1. Imports (Librerías externas -> Propias)
import jsonDbHandler from '../../../shared/jsonDbHandler.js'; 

const FOLDER = '/bodega';
const FILE = 'inventario.json';

// 2. Helper functions (Funciones internas no exportadas)
const _isAvailable = (item) => item.estado === 'disponible';

const _obtenerNuevoId = async () => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    if (lista.length === 0) return 1;
    return Math.max(...lista.map(p => p.id)) + 1;
};

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

// 3. Main functions (Funciones exportadas individualmente)

// ################# CREAR #################
export const createProducto = async (data) => {
    return await _procesarGuardado(data);
};

// ################# ACTUALIZAR #################
export const updateProducto = async (id, data) => {
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

// ################# BUSQUEDA #################

/**
 * @description Obtener todos los productos del inventario
 */
export const getAll = async () => {
    try {
        return await jsonDbHandler.leer(FOLDER, FILE);
    } catch (error) {
        throw new Error("Error al leer el inventario");
    }
};

/**
 * @description Obtener solo productos activos
 */
export const getAllActivos = async () => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista.filter(p => p.activo === true);
};

/**
 * @description Obtener un producto por su ID
 * @param {number} id - ID del producto a buscar
 */
export const getProductoById = async (id) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista.find(p => p.id === id);
};

// ################# ELIMINAR (Soft Delete) #################
/**
 * @description Desactivar un producto (soft delete)
 */
export const deleteProducto = async (id) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const index = lista.findIndex(p => p.id === id);

    if (index === -1) {
        const error = new Error("Producto no encontrado");
        error.status = 404;
        throw error;
    }

    lista[index].activo = false; 
    await jsonDbHandler.escribir(FOLDER, FILE, lista);

    return { message: "Producto eliminado (soft delete)" };
};

// ################# ELIMINAR (Hard Delete) #################
/**
 * @description Eliminar un producto permanentemente
 */
export const deleteProductoHard = async (id) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const index = lista.findIndex(p => p.id === id);

    if (index === -1) {
        const error = new Error("Producto no encontrado");
        error.status = 404;
        throw error;
    }

    lista.splice(index, 1); 
    await jsonDbHandler.escribir(FOLDER, FILE, lista);

    return { message: "Producto eliminado definitivamente" };
};

// ################# ASIGNAR HERRAMIENTA #################
/** 
 * @description Asignar una herramienta a un trabajador
 */
export const processToolAssignment = async (itemId, rutTrabajador) => {
    try {
        const items = await jsonDbHandler.leer(FOLDER, FILE);
        const itemIndex = items.findIndex(i => i.id === itemId);

        if (itemIndex === -1) {
            throw new Error("Herramienta no encontrada en la base de datos.");
        }

        if (!_isAvailable(items[itemIndex])) {
            throw new Error(`La herramienta ${itemId} ya se encuentra en uso por ${items[itemIndex].asignado_a}.`);
        }

        items[itemIndex].estado = 'en_uso';
        items[itemIndex].asignado_a = rutTrabajador;

        await jsonDbHandler.escribir(FOLDER, FILE, items);
        
        return items[itemIndex];
    } catch (error) {
        throw new Error("Error procesando asignación: " + error.message);
    }
};