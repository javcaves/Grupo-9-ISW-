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

import jsonDbHandler from '../../../shared/jsonDbHandler.js';

const FOLDER = 'gestion_actividades';
const FILE = 'categorias.json';

const nivelRiesgo_permitido = ['bajo', 'medio', 'alto'];

/******CREAR*******/
export const crearCategoria = async (data, usuarioId)=>{
    //validar usuario
    if(!usuarioId){
        const error = new Error("se requiere id de usuario para crear categoria");
        error.status = 400;
        throw error;
    }
    //validar ingreso de nombre de categoria
    if(!data.nombre){
        const error = new Error("se requiere nombre de la categoria para crearla");
        error.status = 400;
        throw error;
    }

    //validar nivel de riesgo
    if(data.nivelRiesgo && !nivelRiesgo_permitido.includes(data.nivelRiesgo.toLowerCase())){
        const error = new Error("el nivel de riesgo ingresado no es valido");
        error.status = 400;
        throw error;
    }

    const yaExiste = await existeCategoria(data.nombre);

    if(yaExiste){
        const error = new Error("ya existe una categoria con este nombre");
        error.status = 400;
        throw error;
    }


    //debo hacer que nivelRiesgo sea valido(?)


    return await _procesarguardado(data, usuarioId);
};  

//validacion en creacion
export const existeCategoria = async (nombre)=>{
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista.some(c => nombre.toLowerCase() === nombre.toLowerCase());
};

/******busqueda*****/

//obtener todas las categorias
export const obtenerTodasCat = async ()=>{
return await jsonDbHandler.leer(FOLDER, FILE);
};

/**
 * Obtener solo categorias activas
 */
export const obtenerTodasActivas = async () => {
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    return lista.filter(c => c.activo === true);
};

//obtener registro de categorias por id
export const obtenerCatPorId = async (id) =>{
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const categoria = lista.find(c => c.id === parseInt(id));

    if (!categoria){
        const error = new Error("registro no encontrado");
        error.status = 404;
        throw error;
    }

    return categoria;
};

//obtener un registro de categoria por nivel de riesgo

export const obtenerPorRiesgo = async (nivelRiesgo) =>{
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    //filtro que la categoria esté activa y que nivel de riesgo es valido
    return lista.filter(c => c.activo === true && c.nivelRiesgo === nivelRiesgo);
};

//buscar por nombre
export const buscarNombreCat = async () =>{
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    // filtra que esté activo
    //return lista.filter(c => c.activo === true && nombre.toLowerCase() === nombre.toLowerCase());
    // necesario que esteé activo(?

    // solo busca por nombre sin importar que esté activo
    return lista.filter(c => c.nombre.toLowerCase() === nombre.toLowerCase());
}


//busqueda dinamica por nombre y descripcion
export const buscarDinamicoCat = async () =>{
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const t = termino_c.toLowerCase();

    return lista.filter(c =>{
        const nombre = c.nombre.toLowerCase();
        //agregar espacio vacio de separacion de palabras
        const descripcion = (c.descripcion || '').toLowerCase();

        return nombre.includes(t) || descripcion.includes(t);
    });
}

/*****actualizar*****/
export const actualizarCat = async(id, data, usuarioId) =>{
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    const index = lista.findIndex(c => c.id === parseInt(id));

    if (index === -1){
        const error = new Error("no se encontro registro para actualizar");
        error.status = 404;
        throw error;
    }

    //validar nivel de riesgo si es que se ingresa
    if(data.nivelRiesgo && !nivelRiesgo_permitido.includes(data.nivelRiesgo.toLowerCase())){
        const error = new Error("el nivel de riesgo ingresado no es valido");
        error.status = 400;
        throw error;
    }

    //dejar fecha de actualizacion al dia de hoy
    const ahora = new Date().toISOString();

    const registroActualizadoCat = {
        ...lista[index],
        ...data,
        id: lista[index].id,
        nivelRiesgo: lista[index].nivelRiesgo,
        actualizadoPor: usuarioId,
        fecha_actualizacion: ahora
    };

    lista[index] = registroActualizadoCat;
    await jsonDbHandler.escribir(FOLDER, FILE, lista);

    return registroActualizadoCat;
};



/******eliminar*****/
//solo desactivar categoria
export const desactivarCat = async(criterio ={}) =>{
    let lista = await jsonDbHandler.leer(FOLDER, FILE);
    const {id,nombre} = criterio;

    lista = lista.map(c => {
        let match = false;
        if (id) match = c.id === c.parseInt(id);
        else if (nombre) match = c.nombre.toLowerCase() === nombre.toLowerCase();
        else match = true;

        return match ? {...c, activo: false} : c;
    });

    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return {message: "desactivacion exitosa"};
};

//eliminar desde raiz (desde el archivo)
export const eliminarCat = async(criterio = {}) =>{
    let lista = await jsonDbHandler.leer(FOLDER, FILE);
    const {id, nombre} = criterio;

    const nuevaLista = lista.filter(c =>{
        if (id) return c.id !== parseInt(id);
        if (nombre) return c.nombre.toLowerCase() !== nombre.toLowerCase();
        return true; //si no hay criterio no elimina

    });

    await jsonDbHandler.escribir(FOLDER, FILE, nuevaLista);
    return {message: "eliminacion exitosa"};
};


/********helpers**********/
const _procesarguardado = async(data, usuarioId)=>{
    const lista = await jsonDbHandler.leer(FOLDER, FILE);
    //nuevo id hace id automatico?
    const nuevoId = lista.length > 0 ? Math.max(...lista.map(c => c.id)) + 1 : 1;

    // usar atributo de fecha
    const ahora = new Date().toISOString();

    const nuevoRegistro = {
        ...data,
        id: nuevoId,
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        nivelRiesgo: nivelRiesgo,
        activo: true,
        fecha_creacion: ahora,
        fecha_actualizacion: ahora,
        creadoPor: usuarioId,
        actualizadoPor: usuarioId
    };


    lista.push(nuevoRegistro);

    return nuevoRegistro;


};