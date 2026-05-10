/**
 * @typedef {Object} Empleado
 * @property {number} id - Identificador único autoincremental
 * @property {string} rut - RUT normalizado (sin puntos, con guion y Mayúscula)
 * @property {string} nombre - Nombres del empleado
 * @property {string} apellido - Apellidos del empleado
 * @property {string} observacion - Observacion sobre el empleado
 * @property {string} correo - Email vinculado
 * @property {string} cargo - Rol en la empresa
 * @property {date} fecha_ingreso - Fecha de ingreso a la empresa
 * @property {number} numero - Número de contacto
 * @property {boolean} activo - Estado de la cuenta (Soft Delete)
 */
import jsonDbHandler from '../../shared/jsonDbHandler.js';
import * as PowerService from '../power/power.service.js';

const FOLDER = 'recursos_humanos';
const FILE = 'usuarios.json';

const NIVELES = {
    'ROOT': 0,
    'ADMIN': 1,
    'SUPERVISOR': 2,
    'ENCARGADO': 3,
    'EMPLEADO': 4,
    'SIN_ASIGNAR': 5
};

// ################# HELPERS DE LINAJE #################

/**
 * Función recursiva para verificar si un ejecutor es ancestro de un objetivo
 */
const esAncestor = async (idEjecutor, idObjetivo, listaUsuarios) => {
    const objetivo = listaUsuarios.find(u => u.id === idObjetivo);
    
    if (!objetivo || !objetivo.creado_por) return false;
    if (objetivo.creado_por === idEjecutor) return true;

    // Si no es el padre directo, buscamos al padre del padre
    return await esAncestor(idEjecutor, objetivo.creado_por, listaUsuarios);
};

// ################# CREAR #################

export const crearUsuario = async (data, ejecutor) => {
    if (data.rol === 'ROOT') throw Object.assign(new Error("El ROOT es único."), { status: 403 });

    const nivelEjecutor = NIVELES[ejecutor.cargo];
    const nivelNuevo = NIVELES[data.rol];

    if (nivelNuevo < nivelEjecutor) {
        throw Object.assign(new Error("No puedes crear un cargo superior."), { status: 403 });
    }

    const usuarios = await obtenerTodos();
    if (usuarios.some(u => u.rut === data.rut)) {
        throw Object.assign(new Error("El RUT ya existe."), { status: 400 });
    }

    const nuevoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;

    const nuevoUsuario = {
        ...data,
        id: nuevoId,
        creado_por: ejecutor.id,
        activo: true,
        fecha_registro: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);
    await jsonDbHandler.escribir(FOLDER, FILE, usuarios);

    if (data.powers) {
        await PowerService.asignarPoderes(nuevoId, data.powers, ejecutor);
    }

    return nuevoUsuario;
};

// ################# ACTUALIZAR #################

export const actualizar = async (id, data, ejecutor) => {
    const lista = await obtenerTodos();
    const index = lista.findIndex(u => u.id === parseInt(id));
    if (index === -1) throw Object.assign(new Error("No encontrado"), { status: 404 });

    const objetivo = lista[index];
    const esRoot = ejecutor.cargo === 'ROOT';
    
    // REGLA: Si es ADMIN, solo ancestros o ROOT.
    if (objetivo.rol === 'ADMIN') {
        const esPadreOAncestro = await esAncestor(ejecutor.id, objetivo.id, lista);
        if (!esRoot && !esPadreOAncestro) {
            throw Object.assign(new Error("Solo ancestros directos pueden editar a un ADMIN."), { status: 403 });
        }
    } 
    // Para cargos inferiores, basta con tener el poder USER:UPDATE (validado en controlador)
    
    if (data.powers) {
        await PowerService.asignarPoderes(id, data.powers, ejecutor);
    }

    lista[index] = { ...objetivo, ...data, id: objetivo.id, creado_por: objetivo.creado_por };
    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return lista[index];
};

// ################# ELIMINAR #################

export const eliminar = async (id, ejecutor) => {
    let lista = await obtenerTodos();
    const index = lista.findIndex(u => u.id === parseInt(id));
    if (index === -1) throw Object.assign(new Error("No encontrado"), { status: 404 });

    const objetivo = lista[index];
    const esRoot = ejecutor.cargo === 'ROOT';

    if (objetivo.rol === 'ROOT') throw new Error("ROOT es intocable.");

    // Lógica de jerarquía para eliminación
    if (objetivo.rol === 'ADMIN') {
        const esPadreOAncestro = await esAncestor(ejecutor.id, objetivo.id, lista);
        if (!esRoot && !esPadreOAncestro) {
            throw Object.assign(new Error("No tienes autoridad sobre este ADMIN."), { status: 403 });
        }
    } else {
        // Para Supervisor, Encargado, Empleado: Cualquier Admin (con poder DELETE) puede.
        if (NIVELES[ejecutor.cargo] > NIVELES.ADMIN) {
            // Si el ejecutor no es Admin/Root, solo puede borrar si es el padre directo
            if (objetivo.creado_por !== ejecutor.id) {
                throw Object.assign(new Error("No tienes permiso para eliminar a este usuario."), { status: 403 });
            }
        }
    }

    lista[index].activo = false;
    lista[index].rol = 'SIN_ASIGNAR';
    await PowerService.revocarPoderesPorEliminacion(id);

    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return { message: "Eliminado con éxito." };
};

// ################# BÚSQUEDAS (READ) #################

export const obtenerTodos = async () => {
    return await jsonDbHandler.leer(FOLDER, FILE) || [];
};

export const buscar = async (filtros) => {
    const lista = await obtenerTodos();
    const asignaciones = await jsonDbHandler.leer(FOLDER, 'usuario_power.json') || [];

    return lista.filter(u => {
        let match = true;
        if (filtros.id) match = match && u.id === parseInt(filtros.id);
        if (filtros.rut) match = match && u.rut === filtros.rut;
        if (filtros.nombre) match = match && u.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
        if (filtros.cargo) match = match && u.rol === filtros.cargo;
        if (filtros.activo !== undefined) match = match && u.activo === filtros.activo;
        
        // Filtro especial por PODER
        if (filtros.poder) {
            const tieneEsePoder = asignaciones.some(asig => 
                asig.id_usuario === u.id && 
                asig.id_power === filtros.poder && 
                asig.activo
            );
            match = match && tieneEsePoder;
        }

        return match;
    });
};

export const obtenerPorId = async (id) => {
    const lista = await obtenerTodos();
    return lista.find(u => u.id === parseInt(id));
};