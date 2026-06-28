
import * as AsistenciaService from "./asistencia.service.js";
import { 
    asistenciaCreateValidation, 
    registroIndividualUpdateValidation, 
    empleadoRegistrarValidation 
} from "./asistencia.validations.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";

export const crearAsistencia = async (req, res) => {
    try {
        const { error, value } = asistenciaCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos de entrada inválidos", error.message);

        // id_usuario viene inyectado por tu middleware authenticateJwt
        const [nueva, err] = await AsistenciaService.crearAsistenciaService(value.id_turno, req.user.id_usuario);
        if (err) return handleErrorClient(res, 400, "No se pudo crear la jornada", err);

        return handleSuccess(res, 201, "Jornada de asistencia inicializada y QR/Token disponible.", nueva);
    } catch (error) {
        return handleErrorServer(res, 500, "Error crítico de servidor", error.message);
    }
};

export const mostrarAsistenciaActual = async (req, res) => {
    try {
        const { id_turno } = req.params;
        const [resultado, err] = await AsistenciaService.mostrarAsistenciaActualService(id_turno);
        if (err) return handleErrorClient(res, 404, "Asistencia no disponible", err);

        return handleSuccess(res, 200, "Snapshot actual obtenido", resultado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error interno de servidor", error.message);
    }
};

export const editarRegistroIndividual = async (req, res) => {
    try {
        const { id_asistencia, id_empleado } = req.params;
        const { error, value } = registroIndividualUpdateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Parámetros de edición inválidos", error.message);

        const [actualizado, err] = await AsistenciaService.editarRegistroAsistenciaService(
            id_asistencia, id_empleado, value, req.user.id_usuario
        );
        if (err) return handleErrorClient(res, 400, "Modificación denegada", err);

        return handleSuccess(res, 200, "Registro actualizado y auditoría grabada con éxito", actualizado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error en edición manual", error.message);
    }
};

export const eliminarAsistencia = async (req, res) => {
    try {
        const { id_asistencia } = req.params;
        const [resultado, err] = await AsistenciaService.eliminarAsistenciaTurnoService(id_asistencia);
        if (err) return handleErrorClient(res, 403, "Imposible eliminar", err);

        return handleSuccess(res, 200, "Baja de asistencia completada", resultado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al eliminar jornada", error.message);
    }
};

export const listarHistorial = async (req, res) => {
    try {
        const { id_proyecto } = req.params;
        const lista = await AsistenciaService.obtenerHistorialService(id_proyecto);
        return handleSuccess(res, 200, "Historial cargado correctamente", lista);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de base de datos", error.message);
    }
};

export const editarHistorialPasado = async (req, res) => {
    try {
        const { id_asistencia, id_empleado } = req.params;
        const { error, value } = registroIndividualUpdateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos erróneos", error.message);

        const [modificado, err] = await AsistenciaService.editarRegistroAsistenciaService(
            id_asistencia, id_empleado, value, req.user.id_usuario
        );
        if (err) return handleErrorClient(res, 400, "Error en reglas históricas", err);

        return handleSuccess(res, 200, "Historial modificado con éxito", modificado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

export const obtenerMisAsistenciasPorProyecto = async (req, res) => {
    try {
        const { id_proyecto } = req.params;

        const [historial, err] = await AsistenciaService.obtenerMiHistorialService(
            req.user.id_usuario,
            id_proyecto
        );

        if (err) {
            return handleErrorClient(
                res,
                403,
                "No fue posible obtener el historial",
                err
            );
        }

        return handleSuccess(
            res,
            200,
            "Historial de asistencia obtenido correctamente",
            historial
        );

    } catch (error) {
        return handleErrorServer(
            res,
            500,
            "Error de servidor",
            error.message
        );
    }
};

export async function obtenerMiAsistenciaActual(req, res) {
  try {
    const idEmpleado = req.user?.id_usuario;
    
    // Capturamos ambas variantes posibles para máxima compatibilidad
    const id_turno = req.query.id_turno || req.query.idTurno;

    console.log("📥 [Backend] Query Params Recibidos:", req.query); // <-- Agrega este log para auditar en tu terminal
    console.log("📥 [Backend] ID Turno procesado:", id_turno);

    // Validación: Si no viene ninguna de las dos variantes
    if (!id_turno) {
      return res.status(200).json({
        success: true,
        message: "No se proporcionó un ID de turno para buscar.",
        data: null
      });
    }

    // Invocar al servicio pasando el ID unificado
    const resultadoService = await AsistenciaService.obtenerMiAsistenciaActual(
      idEmpleado,
      Number(id_turno) 
    );

    if (!resultadoService.success) {
      return res.status(400).json({
        success: false,
        message: resultadoService.error || "Error al procesar la asistencia."
      });
    }

    return res.status(200).json({
      success: true,
      message: resultadoService.data 
        ? "Asistencia actual obtenida con éxito." 
        : "No se registran marcas de asistencia para este turno hoy.",
      data: resultadoService.data
    });

  } catch (error) {
    console.error("🔥 Error crítico en controlador obtenerMiAsistenciaActual:", error);
    return res.status(500).json({
      success: false,
      message: "Ocurrió un error inesperado en el servidor.",
      error: error.message
    });
  }
}

export const registrarAutoAsistenciaEmpleado = async (req, res) => {
    try {
        const { error, value } = empleadoRegistrarValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Error en formato de marcaje", error.message);

        const [resultado, err] = await AsistenciaService.marcarAsistenciaEmpleadoService(req.user.id_usuario, value);
        if (err) return handleErrorClient(res, 400, "Marcaje rechazado", err);

        return handleSuccess(res, 200, "Operación exitosa", resultado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al procesar el registro", error.message);
    }
};