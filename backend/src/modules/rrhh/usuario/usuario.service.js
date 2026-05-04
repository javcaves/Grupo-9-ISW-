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
import jsonDbHandler from '../../../shared/jsonDbHandler.js';

const FOLDER = 'recursos_humanos';
const FILE = 'empleados.json';

const NIVELES = {
    'ROOT': 0,
    'ADMIN': 1,
    'SUPERVISOR': 2,
    'ENCARGADO': 3,
    'EMPLEADO': 4,
    'SIN_ASIGNAR': 5
};

// ################# CREAR #################

/**
 * @param {Object} data - Datos del nuevo empleado
 * @param {Object} ejecutor - Objeto del usuario que logueado { id, cargo, powers }
 */
export const crearEmpleado = async (data, ejecutor) => {
    // REGLA 0: No se puede crear otro ROOT
    if (data.cargo === 'ROOT') {
        throw Object.assign(new Error("Acción prohibida: El ROOT es único."), { status: 403 });
    }

    // Validar quién puede crear a quién
    const nivelEjecutor = NIVELES[ejecutor.cargo];
    const nivelNuevo = NIVELES[data.cargo];

    // Los Admin pueden crear otros Admin (nivel 1 == 1)
    // Supervisores/Encargados solo pueden crear Empleados (nivel 4 > nivel 2/3)
    if (nivelNuevo < nivelEjecutor) {
        throw Object.assign(new Error("No puedes crear un cargo superior al tuyo."), { status: 403 });
    }

    // Si es Admin creando Admin, validar que no otorgue poderes que él no tiene
    if (ejecutor.cargo === 'ADMIN' && data.cargo === 'ADMIN') {
        const tienePoderesValidos = data.powers.every(p => ejecutor.powers.includes(p));
        if (!tienePoderesValidos) {
            throw Object.assign(new Error("No puedes otorgar poderes que tú no posees."), { status: 403 });
        }
    }

    const empleadoExistente = await existeEmpleado(data.rut, data.cargo);
    if (empleadoExistente) {
        throw Object.assign(new Error("El trabajador ya existe en este rol."), { status: 400 });
    }

    const empleados = await obtenerTodos();
    const nuevoId = empleados.length > 0 ? Math.max(...empleados.map(e => e.id)) + 1 : 1;

    const nuevoEmpleado = {
        ...data,
        id: nuevoId,
        creado_por: ejecutor.id, // REGISTRO DE LINAJE
        fecha_asignacion: new Date().toISOString(),
        activo: true
    };

    empleados.push(nuevoEmpleado);
    await jsonDbHandler.escribir(FOLDER, FILE, empleados);
    return nuevoEmpleado;
};

// ################# ACTUALIZAR #################

export const actualizar = async (id, data, ejecutor) => {
    const lista = await obtenerTodos();
    const index = lista.findIndex(e => e.id === parseInt(id));

    if (index === -1) throw Object.assign(new Error("No encontrado"), { status: 404 });

    const objetivo = lista[index];

    // REGLA 3: Un Admin puede editar a quien creó o a hijos de quien creó (Simplificado a creador directo)
    const esCreadorDirecto = objetivo.creado_por === ejecutor.id;
    const esRoot = ejecutor.cargo === 'ROOT';

    if (!esRoot && !esCreadorDirecto) {
        throw Object.assign(new Error("No tienes permiso para editar a este usuario (No eres su creador)."), { status: 403 });
    }

    // Si edita poderes, validar que no asigne lo que no tiene
    if (data.powers && ejecutor.cargo !== 'ROOT') {
        const tienePoderesValidos = data.powers.every(p => ejecutor.powers.includes(p));
        if (!tienePoderesValidos) throw new Error("No puedes otorgar poderes que no tienes.");
    }

    lista[index] = { ...objetivo, ...data, id: objetivo.id, creado_por: objetivo.creado_por };
    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return lista[index];
};

// ################# ELIMINAR #################

export const eliminar = async (id, ejecutor) => {
    let lista = await obtenerTodos();
    const index = lista.findIndex(e => e.id === parseInt(id));

    if (index === -1) throw Object.assign(new Error("No encontrado"), { status: 404 });

    const objetivo = lista[index];

    // REGLA 0: Root es irrevocable
    if (objetivo.cargo === 'ROOT') {
        throw Object.assign(new Error("El ROOT no puede ser eliminado."), { status: 403 });
    }

    // REGLA 2: Root elimina todo. Admin elimina lo que él generó.
    const esRoot = ejecutor.cargo === 'ROOT';
    const esCreador = objetivo.creado_por === ejecutor.id;

    if (!esRoot && !esCreador) {
        throw Object.assign(new Error("Solo el creador o el ROOT pueden eliminar este registro."), { status: 403 });
    }

    // REGLA 2: El rol pasa a SIN_ASIGNAR y activo a false
    lista[index].activo = false;
    lista[index].cargo = 'SIN_ASIGNAR';
    lista[index].powers = [];

    await jsonDbHandler.escribir(FOLDER, FILE, lista);
    return { message: "Usuario desvinculado y rol revocado correctamente." };
};

// ################# BUSQUEDA #################

export const obtenerTodos = async () => {
    return await jsonDbHandler.leer(FOLDER, FILE) || [];
};

export const existeEmpleado = async (rut, cargo) => {
    const lista = await obtenerTodos();
    return lista.some(e => e.rut === rut && e.cargo === cargo);
};