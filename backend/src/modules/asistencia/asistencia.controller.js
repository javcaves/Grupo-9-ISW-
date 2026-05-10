import * as AsistenciaService from './asistencia.service.js';

/**
 * 1. Generar Token/QR de Asistencia (Encargado/Supervisor)
 * POST /asistencia/generar
 */
export const crearAsistencia = async (req, res) => {
    try {
        const { id_turno } = req.body;
        const ejecutor = req.user; // Viene del middleware de autenticación

        const nuevaAsistencia = await AsistenciaService.crearAsistencia(id_turno, ejecutor);
        
        return res.status(201).json({
            success: true,
            message: "Asistencia generada exitosamente.",
            data: nuevaAsistencia
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * 2 & 3. Ver y Editar Detalle (Encargado/Supervisor)
 * PUT /asistencia/:idAsistencia/empleado/:idEmpleado
 */
export const actualizarEstadoManual = async (req, res) => {
    try {
        const { idAsistencia, idEmpleado } = req.params;
        const data = req.body; // Puede contener: estado, descripcion, hora_ingreso
        const ejecutor = req.user;

        const actualizado = await AsistenciaService.actualizarEstadoManual(
            idAsistencia, 
            idEmpleado, 
            data, 
            ejecutor
        );

        return res.status(200).json({
            success: true,
            message: "Registro de asistencia actualizado.",
            data: actualizado
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * 4. Eliminar Asistencia (Encargado/Supervisor)
 * DELETE /asistencia/:idAsistencia
 */
export const eliminarAsistencia = async (req, res) => {
    try {
        const { idAsistencia } = req.params;
        const ejecutor = req.user;

        const resultado = await AsistenciaService.eliminarAsistencia(idAsistencia, ejecutor);

        return res.status(200).json({
            success: true,
            message: resultado.message
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * 5. Obtener Historial (Encargado/Supervisor)
 * GET /asistencia/historial
 */
export const obtenerHistorial = async (req, res) => {
    try {
        const filtros = req.query;
        const historial = await AsistenciaService.obtenerHistorial(filtros);

        return res.status(200).json({
            success: true,
            data: historial
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Error al obtener el historial de asistencia."
        });
    }
};

/**
 * Obtener detalle de una asistencia específica
 * GET /asistencia/:idAsistencia/detalle
 */
export const obtenerDetalleAsistencia = async (req, res) => {
    try {
        const { idAsistencia } = req.params;
        const detalle = await AsistenciaService.obtenerDetalleAsistencia(idAsistencia);

        return res.status(200).json({
            success: true,
            data: detalle
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Error al obtener el detalle de la asistencia."
        });
    }
};

/**
 * 6. Registro de Asistencia por Token (Empleado)
 * POST /asistencia/marcar
 */
export const registrarMarcaEmpleado = async (req, res) => {
    try {
        const { token } = req.body;
        const idEmpleado = req.user.id; // El empleado está logueado

        const registro = await AsistenciaService.registrarMarcaEmpleado(token, idEmpleado);

        return res.status(200).json({
            success: true,
            message: "Asistencia registrada correctamente.",
            data: registro
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message
        });
    }
};