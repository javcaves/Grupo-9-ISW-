/**
 * @typedef {Object} Categoria
 * @property {number} id - id unico
 * @property {string} nombre - nombre de la cagtegoria
 * @property {string} descripcion - descripcion detallada de la categoria
 * @property {string} nivelRiesgo - bajo, medio, alto
 * @property {boolean} activo - estado de la categoria (activa o eliminada)
 * @property {date} fecha_creacion - Fecha de creacion de categoria
 * @property {date} fecha_actualizacion - Fecha de creacion de categoria
 * @property {number} creadoPor - muestra el id de quien creo la categoria
 * @property {number} actualizadoPor - muestra el id de quien actualizo por ultima vez la categoria
 * @property {boolean} activo - estado de la categoria (activa o eliminada)
 */
/**
 * @file categorias.service.js
 * @description Gestión de categorías de productos con ES Modules
 */

import jsonDbHandler from '../../../shared/jsonDbHandler.js';

const FOLDER = 'gestion_actividades';
const FILE = 'categorias.json';

const nivelRiesgo_permitido = ['bajo', 'medio', 'alto'];

// ################# HELPERS INTERNOS #################

/**
 * Lanza un objeto de error con estatus
 */
const lanzarError = (mensaje, status) => {
    const error = new Error(mensaje);
    error.status = status;
    throw error;
};

/**
 * Procesa la persistencia de una nueva categoría
 */
const _procesarguardado = async (data, usuarioId) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    
    // Generar ID autoincremental
    const nuevoId = lista.length > 0 ? Math.max(...lista.map(c => c.id)) + 1 : 1;
    const ahora = new Date().toISOString();

    const nuevoRegistro = {
        id: nuevoId,
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        nivelRiesgo: data.nivelRiesgo ? data.nivelRiesgo.toLowerCase() : 'bajo',
        activo: true,
        fecha_creacion: ahora,
        fecha_actualizacion: ahora,
        creadoPor: usuarioId,
        actualizadoPor: usuarioId
    };

    lista.push(nuevoRegistro);
    
    // Guardar físicamente en el archivo JSON
    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return nuevoRegistro;
};

// ################# FUNCIONES DE VALIDACIÓN #################

export const existeCategoria = async (nombre) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    // Corregido: Comparar contra c.nombre
    return lista.some(c => c.nombre.toLowerCase() === nombre.toLowerCase());
};

// ################# MAIN FUNCTIONS (CRUD) #################

// ======= CREAR =======
export const crearCategoria = async (data, usuarioId) => {
    if (!usuarioId) lanzarError("Se requiere ID de usuario", 400);
    if (!data.nombre) lanzarError("El nombre de la categoría es obligatorio", 400);

    // Validar nivel de riesgo
    if (data.nivelRiesgo && !nivelRiesgo_permitido.includes(data.nivelRiesgo.toLowerCase())) {
        lanzarError("El nivel de riesgo ingresado no es válido (bajo, medio, alto)", 400);
    }

    // Validar duplicados
    const yaExiste = await existeCategoria(data.nombre);
    if (yaExiste) lanzarError("Ya existe una categoría con este nombre", 400);

    return await _procesarguardado(data, usuarioId);
};

// ======= LEER =======

export const obtenerTodasCat = async () => {
    return await jsonDbHandler.leer(FOLDER, FILE);
};

export const obtenerTodasActivas = async () => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista.filter(c => c.activo === true);
};

export const obtenerCatPorId = async (id) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const categoria = lista.find(c => c.id === parseInt(id));

    if (!categoria) lanzarError("Registro no encontrado", 404);
    return categoria;
};

export const obtenerPorRiesgo = async (nivelRiesgo) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista.filter(c => c.activo === true && c.nivelRiesgo === nivelRiesgo.toLowerCase());
};

export const buscarDinamicoCat = async (termino) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    if (!termino) return lista;
    
    const t = termino.toLowerCase();
    return lista.filter(c => {
        const nombre = (c.nombre || '').toLowerCase();
        const descripcion = (c.descripcion || '').toLowerCase();
        return nombre.includes(t) || descripcion.includes(t);
    });
};

// ======= ACTUALIZAR =======

export const actualizarCat = async (id, data, usuarioId) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const index = lista.findIndex(c => c.id === parseInt(id));

    if (index === -1) lanzarError("No se encontró el registro para actualizar", 404);

    if (data.nivelRiesgo && !nivelRiesgo_permitido.includes(data.nivelRiesgo.toLowerCase())) {
        lanzarError("Nivel de riesgo no válido", 400);
    }

    const ahora = new Date().toISOString();

    const registroActualizado = {
        ...lista[index],
        ...data,
        id: lista[index].id, // El ID nunca debe cambiar
        actualizadoPor: usuarioId,
        fecha_actualizacion: ahora
    };

    lista[index] = registroActualizado;
    await jsonDbHandler.escribir(FOLDER, FILE, lista);

    return registroActualizado;
};

// ======= ELIMINAR =======

/**
 * Borrado lógico (Desactivar)
 */
export const desactivarCat = async (id) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const index = lista.findIndex(c => c.id === parseInt(id));

    if (index === -1) lanzarError("Categoría no encontrada", 404);

    lista[index].activo = false;
    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    
    return { message: "Desactivación exitosa" };
};

/**
 * Borrado físico (Hard Delete)
 */
export const eliminarCat = async (id) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const nuevaLista = lista.filter(c => c.id !== parseInt(id));

    if (lista.length === nuevaLista.length) lanzarError("Categoría no encontrada", 404);

    await jsonDbHandler.escribir(FOLDER, FILE, nuevaLista);
    return { message: "Eliminación física exitosa" };
};