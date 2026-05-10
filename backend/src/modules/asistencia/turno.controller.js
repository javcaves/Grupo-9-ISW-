import * as TurnoService from './turno.service.js';

/**
 * Crear un nuevo turno (Encargado/Supervisor del proyecto)
 * POST /turnos
 */
export const crearTurno = async (req, res) => {
    try {
        const datosTurno = req.body;
        const ejecutor = req.user; 

        const nuevoTurno = await TurnoService.crearTurno(datosTurno, ejecutor);

        return res.status(201).json({
            success: true,
            message: "Turno creado exitosamente.",
            data: nuevoTurno
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Asignar una lista de empleados a un turno
 * POST /turnos/:idTurno/empleados
 */
export const asignarEmpleadosATurno = async (req, res) => {
    try {
        const { idTurno } = req.params;
        const { empleados } = req.body; // Array de {id_empleado, fecha_ingreso, fecha_egreso}
        const ejecutor = req.user;

        await TurnoService.asignarEmpleadosATurno(idTurno, empleados, ejecutor);

        return res.status(200).json({
            success: true,
            message: "Empleados asignados al turno correctamente."
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Desvincular un empleado de un turno
 * DELETE /turnos/:idTurno/empleados/:idEmpleado
 */
export const eliminarEmpleadoDeTurno = async (req, res) => {
    try {
        const { idTurno, idEmpleado } = req.params;
        const ejecutor = req.user;

        const resultado = await TurnoService.eliminarEmpleadoDeTurno(idTurno, idEmpleado, ejecutor);

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
 * Desactivar un turno (Soft Delete)
 * DELETE /turnos/:idTurno
 */
export const eliminarTurno = async (req, res) => {
    try {
        const { idTurno } = req.params;
        const ejecutor = req.user;

        const resultado = await TurnoService.eliminarTurno(idTurno, ejecutor);

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
 * Obtener todos los turnos activos de un proyecto específico
 * GET /turnos/proyecto/:idProyecto
 */
export const obtenerTurnosPorProyecto = async (req, res) => {
    try {
        const { idProyecto } = req.params;
        const turnos = await TurnoService.obtenerTurnosPorProyecto(idProyecto);

        return res.status(200).json({
            success: true,
            data: turnos
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Error al obtener los turnos del proyecto."
        });
    }
};