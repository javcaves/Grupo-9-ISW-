/**
 * @typedef {Object} Actividad
 * @property {number} id - ID unico
 * @property {number} id_categoria - ID de la categoría
 * @property {string} tarea - Nombre o descripción corta de la actividad
 * @property {boolean} activo - Estado del registro (Soft Delete)
 */

import jsonDbHandler from '../../../shared/jsonDbHandler.js';

const FOLDER = 'gestion_actividades';
const FILE = 'actividades.json';
const FILE_CATEGORIAS = 'categorias.json';

// ----- Crear -----
export const crearActividad = async(data) => {
    await validarRelaciones (data.id_categoria);
    return await procesarGuardado(data);
};

// ----- Busqueda -----
export const obtenerTodos = async () => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista;
};

export const obtenerTodosActivos = async () => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista.filter(a => a.activo === true);
};

export const obtenerPorID = async (id) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const actividad = lista.find(a => a.id === parseInt(id));

    if (!actividad) {
        const error = new Error("Registro de actividad no encontrado");
        error.status = 404;
        throw error;
    }
    return actividad;
};

export const buscarDinamico = async (termino) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const t = termino.toLowerCase();

    return lista.filter(a => a.tarea.toLowerCase().includes(t));
};

// ----- Actualizar -----

export const actualizar = async (id, data) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const index = lista.findIndex(a => a.id === parseInt(id));

    if (index === -1) {
        const error = new Error("No se encontró la actividad para actualizar");
        error.status = 404;
        throw error;
    }
    if (data.id_categoria) {
        await validarRelaciones(data.id_categoria);
    }
    const registroActualizado = {
        ...lista[index],
        ...data,
        id: lista[index].id // Protegemos el ID original
    };

    lista[index] = registroActualizado;
    await jsonDbHandler.escribir(FOLDER, FILE, lista);

    return registroActualizado;
};

// ----- Eliminar -----

export const eliminar = async (criterio = {}) => {
    let lista = await jsonDbHandler.leer(FOLDER, FILE);
    const { id} = criterio;

    lista = lista.map(a => {
        const match = id && a.id === parseInt(id);
        return match ? { ...a, activo: false } : a;
    });

    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return { message: "Desactivación completada con éxito" };
};

export const ELIMINARHARD = async (criterio = {}) => {
    let lista = await jsonDbHandler.leer(FOLDER, FILE);
    const { id } = criterio;

    const nuevaLista = lista.filter(a => {
        if (id) return a.id !== parseInt(id);
        return false;
    });

    await jsonDbHandler.escribir(FOLDER, FILE, nuevaLista);
    return { message: "Eliminación física completada" };
};

// ----- Validaciones -----

const validarRelaciones = async (id_categoria) => {
    //Valida categoria
    const categorias = await jsonDbHandler.leer(FOLDER, FILE_CATEGORIAS);
    if (!categorias.some(c => c.id === parseInt(id_categoria))){
        const error = new Error ("La categoria especificada no existe o no se encuentra activa");
        error.status = 400;
        throw error;
    }
};


const procesarGuardado = async (data) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const nuevoId = lista.length > 0 ? Math.max(...lista.map(a => a.id)) + 1 : 1;

    const nuevoRegistro = { 
        tarea: data.tarea,
        id_categoria: parseInt(data.id_categoria), 
        id: nuevoId, 
        activo: true 
    };

    lista.push(nuevoRegistro);
    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    
    return nuevoRegistro;
};