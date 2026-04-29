import * as AsistenciaService from './asistencia.service.js';
import validators from '../../../shared/validators.js';

const sendResponse = (res, status, payload) => {
    const isError = status >= 400;
    return res.status(status).json({ [isError ? 'error' : 'data']: payload });
};

export const listarAsistencias = async (req, res) => {
    try {
        const lista = await AsistenciaService.obtenerAsistenciasActivas();
        return sendResponse(res, 200, lista);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener las asistencias");
    }
};

export const obtenerDetalleAsistencia = async (req, res) => {
    try {
        const { id } = req.params;
        const detalle = await AsistenciaService.obtenerDetallePorAsistencia(id);
        return sendResponse(res, 200, detalle);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

export const crearCabeceraAsistencia = async (req, res) => {
    try {
        const nueva = await AsistenciaService.crearAsistenciaGeneral(req.body);
        return sendResponse(res, 201, nueva);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

export const registrarEmpleadoEnAsistencia = async (req, res) => {
    try {
        const { correo } = req.body;
        if (correo && !validators.esCorreoValido(correo)) {
            return sendResponse(res, 400, "Correo inválido");
        }

        const registro = await AsistenciaService.registrarAsistenciaEmpleado(req.body);
        return sendResponse(res, 201, registro);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

export const buscarEnAsistencias = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return sendResponse(res, 400, "Se requiere un término de búsqueda (q)");

        const resultados = await AsistenciaService.buscarEmpleadoEnAsistencia(q);
        return sendResponse(res, 200, resultados);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

export const actualizarRegistroEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await AsistenciaService.actualizarAsistenciaEmpleado(id, req.body);
        return sendResponse(res, 200, actualizado);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

export const actualizarCabecera = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await AsistenciaService.actualizarCabeceraAsistencia(id, req.body);
        return sendResponse(res, 200, actualizado);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

export const eliminarAsistencia = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await AsistenciaService.eliminarAsistenciaCompleta(id);
        return sendResponse(res, 200, resultado.message);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};

export const borrarDetalleFisico = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await AsistenciaService.ELIMINAR_DETALLE_HARD(id);
        return sendResponse(res, 200, resultado.message);
    } catch (error) {
        return sendResponse(res, error.status || 500, error.message);
    }
};