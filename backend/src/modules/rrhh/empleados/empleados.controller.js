import * as EmpleadosService from './empleados.service.js';
import validators from '../../../shared/validators.js';

// Helper para uniformar respuestas: { data: ... } o { error: ... }
const sendResponse = (res, status, payload) => {
    const isError = status >= 400;
    return res.status(status).json({ [isError ? 'error' : 'data']: payload });
};

// ################# LISTAR #################

/**
 * Obtener todos los empleados (Activos e Inactivos)
 */
export const listarTodos = async (req, res) => {
    try {
        const lista = await EmpleadosService.obtenerTodos();
        return sendResponse(res, 200, lista);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener la lista completa");
    }
};

/**
 * Obtener empleados filtrados por estado activo y opcionalmente por cargo
 */
export const listarActivos = async (req, res) => {
    try {
        const { cargo } = req.query;
        let lista;

        if (cargo) {
            lista = await EmpleadosService.obtenerActivosPorCargo(cargo);
        } else {
            lista = await EmpleadosService.obtenerTodosActivos();
        }

        return sendResponse(res, 200, lista);
    } catch (error) {
        return sendResponse(res, 500, "Error al filtrar empleados activos");
    }
};

/**
 * Obtener un empleado por su ID
 */
export const obtenerEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const empleado = await EmpleadosService.obtenerPorID(id);
        return sendResponse(res, 200, empleado);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// ################# REGISTRO #################

export const registrarEmpleado = async (req, res) => {
    try {
        const { rut, correo } = req.body;
        if (!validators.esRutValido(rut)) return sendResponse(res, 400, "RUT inválido");
        if (correo && !validators.esCorreoValido(correo)) return sendResponse(res, 400, "Correo inválido");

        const nuevo = await EmpleadosService.crearEmpleado(req.body);
        return sendResponse(res, 201, nuevo);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

export const registrarAdmin = async (req, res) => {
    try {
        const { rut } = req.body;
        if (!validators.esRutValido(rut)) return sendResponse(res, 400, "RUT inválido");

        const nuevo = await EmpleadosService.crearAdmin(req.body);
        return sendResponse(res, 201, nuevo);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// ################# BUSQUEDA Y ACTUALIZACIÓN #################

export const buscarEmpleados = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return sendResponse(res, 400, "Se requiere un término de búsqueda (q)");

        const resultados = await EmpleadosService.buscarDinamico(q);
        return sendResponse(res, 200, resultados);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

export const actualizarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await EmpleadosService.actualizar(id, req.body);
        return sendResponse(res, 200, actualizado);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

// ################# ELIMINACIÓN #################

export const eliminarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await EmpleadosService.eliminar({ id });
        return sendResponse(res, 200, resultado.message);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

export const borrarEmpleadoDefinitivamente = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await EmpleadosService.ELIMINARHARD({ id });
        return sendResponse(res, 200, resultado.message);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};