//turno.controller.js: Controladores para gestión de turnos, incluyendo creación, actualización, eliminación y asignación de empleados a turnos. Implementa validaciones de entrada utilizando Joi y maneja respuestas estándar para éxito y error. [cite: 2788, 2808]
import {
    turnoCreateValidation,
    turnoUpdateValidation,
    turnoEmpleadoAddValidation,
    turnoColacionValidation,
    turnoFeriadoValidation
} from "./turno.validations.js";
import * as TurnoService from "./turno.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";

// ==================== TURNO ====================

// ----- Listar -----

export const listarTurnosPorProyecto = async (req, res) => {
    try {
        const { id_proyecto } = req.params;
        const lista = await TurnoService.obtenerTodosActivosPorProyecto(id_proyecto);
        return handleSuccess(res, 200, "Turnos del proyecto obtenidos", lista);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener los turnos", error.message);
    }
};

export const obtenerTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const [turno, err] = await TurnoService.obtenerTurnoPorID(id);
        if (err) return handleErrorClient(res, 404, "No encontrado", err);
        return handleSuccess(res, 200, "Turno obtenido", turno);
    } catch (error) {
        return handleErrorServer(res, 500, "Error interno", error.message);
    }
};

export const listarTurnos = async (req, res) => {
    try {
        const turnos = await TurnoService.listarTurnos ();
        return handleSuccess(res, 200, "Turnos obtenidos", turnos);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener los turnos", error.message);
    }
};
// ----- Registro -----

export const crearTurno = async (req, res) => {
    try {
        const { error, value } = turnoCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const [nuevo, err] = await TurnoService.crearTurno(value);
        if (err) return handleErrorClient(res, 400, "Error de validación de negocio", err);
        return handleSuccess(res, 201, "Turno creado con éxito", nuevo);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

// ----- Actualización -----

export const actualizarTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = turnoUpdateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        if (Object.keys(value).length === 0) {
            return handleErrorClient(res, 400, "Error", "Debe enviar al menos un campo para actualizar");
        }

        const [actualizado, err] = await TurnoService.actualizarTurno(id, value);
        if (err) return handleErrorClient(res, 400, "No se pudo actualizar", err);
        return handleSuccess(res, 200, "Turno actualizado", actualizado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

// ----- Eliminación -----

export const eliminarTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado, err] = await TurnoService.eliminarTurno(id);
        if (err) return handleErrorClient(res, 400, "Operación denegada", err);
        return handleSuccess(res, 200, "Operación exitosa", resultado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

// ==================== TURNO_EMPLEADO ====================

// ----- Agregar empleado -----

export const agregarEmpleadoATurno = async (req, res) => {
    try {
        const { id, id_empleado } = req.params;
        const idTurnoParseado = parseInt(id, 10);
        const idEmpleadoParseado = parseInt(id_empleado, 10);

        if (isNaN(idTurnoParseado) || isNaN(idEmpleadoParseado)) {
            return handleErrorClient(res, 400, "Datos inválidos", "El id del turno y del empleado deben ser números válidos");
        }
        const datosEmpleado = {id_empleado: idEmpleadoParseado};
        const [registro, err] = await TurnoService.agregarEmpleadoATurno(idTurnoParseado, datosEmpleado);
        if (err) return handleErrorClient(res, 400, "No se pudo agregar el empleado", err);
        
        return handleSuccess(res, 201, "Empleado agregado al turno", registro);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

// ----- Eliminar empleado -----

export const eliminarEmpleadoDeTurno = async (req, res) => {
    try {
        const { id, id_empleado } = req.params;
        const [resultado, err] = await TurnoService.eliminarEmpleadoDeTurno(id, id_empleado);
        if (err) return handleErrorClient(res, 400, "Operación denegada", err);

        // El service retorna requiere_confirmacion cuando el empleado tiene estado EN_ESPERA en asistencia
        if (resultado?.requiere_confirmacion) {
            return handleSuccess(res, 200, "Se requiere confirmación para eliminar también el registro de asistencia del día", resultado);
        }

        return handleSuccess(res, 200, "Operación exitosa", resultado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

// ----- Confirmar eliminación con baja de asistencia -----

export const confirmarEliminacionConAsistencia = async (req, res) => {
    try {
        const { id, id_empleado } = req.params;
        const [resultado, err] = await TurnoService.confirmarEliminacionConAsistencia(id, id_empleado);
        if (err) return handleErrorClient(res, 400, "Operación denegada", err);
        return handleSuccess(res, 200, "Empleado desvinculado y asistencia del día eliminada", resultado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

// ----- Configurar colación -----

export const configurarColacion = async (req, res) => {
    try {
        const { id, id_empleado } = req.params;
        const { error, value } = turnoColacionValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const [actualizado, err] = await TurnoService.configurarColacion(id, id_empleado, value);
        if (err) return handleErrorClient(res, 400, "No se pudo configurar la colación", err);
        return handleSuccess(res, 200, "Colación configurada", actualizado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

// ----- Configurar feriados -----

export const configurarTrabajadorFeriado = async (req, res) => {
    try {
        const { id, id_empleado } = req.params;
        const { error, value } = turnoFeriadoValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const [actualizado, err] = await TurnoService.configurarTrabajadorFeriado(id, id_empleado, value.trabaja_feriados);
        if (err) return handleErrorClient(res, 400, "No se pudo actualizar la configuración de feriados", err);
        return handleSuccess(res, 200, "Configuración de feriados actualizada", actualizado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};