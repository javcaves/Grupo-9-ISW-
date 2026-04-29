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
import jsonDbHandler from '../../../shared/jsonDbHandler.js'; // Manejador de base de datos JSON para operaciones CRUD

const FOLDER = '../../data/bodega';
const FILE = 'inventario.json';

// 2. Helper functions (Funciones internas no exportadas)
const _isAvailable = (item) => item.estado === 'disponible';

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

// 3. Main functions (Funciones que exportaremos)

// ################# CREAR #################
const createProducto = async (data) => {
    return await _procesarGuardado(data);
};

// ################# ACTUALIZAR #################
const updateProducto = async (id, data) => {
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
 const getAll = async () => {
    try {
        return await jsonDbHandler.read(FOLDER, FILE);
    } catch (error) {
        throw new Error("Error al leer el inventario");
    }
};

/**
 * @description Obtener solo productos activos
 */
 const getAllActivos = async () => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista.filter(p => p.activo === true);
};

/**
 * @description Obtener un producto por su ID
 * @param {number} id - ID del producto a buscar
 */
const getProductoById = async (id) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista.find(p => p.id === id);
};

// ################# ELIMINAR (Soft Delete) #################
/**
 * @description Desactivar un producto (soft delete)
 * @param {number} id - ID del producto a "eliminar"
 * @returns {Object} - Mensaje de confirmación
 */
 const deleteProducto = async (id) => {
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

// ################# ELIMINAR (Hard Delete) #################
/**
 * @description Eliminar un producto permanentemente
 * @param {number} id - ID del producto a eliminar
 * @returns {Object} - Mensaje de confirmación
 */
const deleteProductoHard = async (id) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const index = lista.findIndex(p => p.id === id);

    if (index === -1) {
        const error = new Error("Producto no encontrado");
        error.status = 404;
        throw error;
    }

    lista.splice(index, 1); // Eliminar completamente
    await jsonDbHandler.escribir(FOLDER, FILE, lista);

    return { message: "Producto eliminado definitivamente" };
};

// ################# ASIGNAR HERRAMIENTA #################
/** 
 * @description Asignar una herramienta a un trabajador, luego se le puedan asignar tareas.
 * @param {string} itemId - ID de la maquinaria (ej. ENC-001).
 * @param {string} rutTrabajador - Identificador del empleado.
 */
const processToolAssignment = async (itemId, rutTrabajador) => {
    try {
        const items = await findItems();
        const itemIndex = items.findIndex(i => i.id === itemId);

        if (itemIndex === -1) {
            throw new Error("Herramienta no encontrada en la base de datos.");
        }

        if (!_isAvailable(items[itemIndex])) {
            throw new Error(`La herramienta ${itemId} ya se encuentra en uso por ${items[itemIndex].asignado_a}.`);
        }

        // Aplicamos los cambios de estado
        items[itemIndex].estado = 'en_uso';
        items[itemIndex].asignado_a = rutTrabajador;

        // Guardamos los datos simulando la BD
        await jsonDbHandler.write(FOLDER, FILE, items);
        
        return items[itemIndex];
    } catch (error) {
        throw new Error("Error procesando asignación: " + error.message);
    }
};

// 4. Exports
export default {
    createProducto,
    updateProducto,
    getAll,
    getAllActivos,
    deleteProducto,
    deleteProductoHard,
    getProductoById,
    processToolAssignment
};