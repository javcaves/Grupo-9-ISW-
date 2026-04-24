/**
 * @typedef {Object} Actividad
 * @property {number} id - ID unico
 * @property {number} id_empleado - ID del empleado asignado
 * @property {number} id_categoria - ID de la categoría
 * @property {number} id_ubicacion - ID de la ubicación
 * @property {string} tarea - Nombre o descripción corta de la actividad
 * @property {string} fecha - Fecha asignada
 * @property {string} hora_inicio - Hora de inicio
 * @property {string} hora_fin - Hora de término
 * @property {string} estado - Pendiente, En curso, Terminado
 * @property {Array} insumos - Lista de objetos
 * @property {boolean} activo - Estado del registro (Soft Delete)
 */

import jsonDbHandler from '../../../shared/jsonDbHandler.js';

const FOLDER = 'gestion_actividades';
const FILE = 'actividades.json';

const FOLDER_BODEGA = 'bodega';
const FILE_ITEMS = 'items.json';
const FOLDER_RRHH = 'recursos_humanos';
const FILE_EMPLEADOS = 'empleados.json';

// ----- Crear -----
export const crearActividad = async(data) => {
    await validarRelaciones (data.id_empleado, data.insumos);
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
        const error = new Error("Registro no encontrado");
        error.status = 404;
        throw error;
    }
    return actividad;
};

export const buscarDinamico = async (termino) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const t = termino.toLowerCase();

    return lista.filter(a => {
        const tarea = a.tarea.toLowerCase();
        const estado = a.estado.toLowerCase();
        return tarea.includes(t) || estado.includes(t);
    });
};

// ----- Actualizar -----

export const actualizar = async (id, data) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const index = lista.findIndex(a => a.id === parseInt(id));

    if (index === -1) {
        const error = new Error("No se encontró el registro para actualizar");
        error.status = 404;
        throw error;
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
    const { id, estado } = criterio;

    lista = lista.map(a => {
        let match = false;
        if (id) match = a.id === parseInt(id);
        else if (estado) match = a.estado === estado;
        else match = true;

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

const validarRelaciones = async (id_empleado, insumos) => {
    //Valida empleado
    if (id_empleado){
        const empleados = await jsonDbHandler.leer(FOLDER_RRHH, FILE_EMPLEADOS);
        if (!empleados.some(e => e.id === parseInt(id_empleado) && e.activo)){
            const error = new Error ("El empleado asignado no existe o no se encuentra activo");
            error.status = 400;
            throw error;
        }
    }

    //valida insumos en bodega
    if (insumos && insumos.length > 0) {
        const items = await jsonDbHandler.leer(FOLDER_BODEGA, FILE_ITEMS);
        for (const insumo of insumos) {
            if (!items.some(i => i.id === parseInt(insumo.id_item))) {
                const error = new Error(`El insumo con ID ${insumo.id_item} no existe en bodega`);
                error.status = 400;
                throw error;
            }
        }
    }
};

const procesarGuardado = async (data) => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const nuevoId = lista.length > 0 ? Math.max(...lista.map(a => a.id)) + 1 : 1;

    const nuevoRegistro = { 
        ...data, 
        id: nuevoId, 
        estado: 'Pendiente', // Valor por defecto
        activo: true 
    };

    lista.push(nuevoRegistro);
    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    
    return nuevoRegistro;
};