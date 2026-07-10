import * as SolicitudAsistenciaService from "./solicitudAsistencia.service.js";
import {
    solicitudAsistenciaCreateValidation,
    solicitudAsistenciaResolverValidation,
    solicitudAsistenciaIdValidation,
} from "./solicitudAsistencia.validations.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";

export const crear = async (req, res) => {
    try {
        const { error, value } = solicitudAsistenciaCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const [nueva, err] = await SolicitudAsistenciaService.crearSolicitud(req.user.id_usuario, value);
        if (err) return handleErrorClient(res, 400, "No se pudo crear la solicitud", err);

        return handleSuccess(res, 201, "Solicitud de corrección enviada", nueva);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};

export const listarPendientes = async (req, res) => {
    try {
        const solicitudes = await SolicitudAsistenciaService.listarPendientes();
        return handleSuccess(res, 200, "Solicitudes pendientes obtenidas", solicitudes);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener solicitudes", error.message);
    }
};

export const listarMias = async (req, res) => {
    try {
        const solicitudes = await SolicitudAsistenciaService.listarMias(req.user.id_usuario);
        return handleSuccess(res, 200, "Tus solicitudes obtenidas", solicitudes);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener tus solicitudes", error.message);
    }
};

export const resolver = async (req, res) => {
    try {
        const { error: idError, value: idValue } = solicitudAsistenciaIdValidation.validate(req.params);
        if (idError) return handleErrorClient(res, 400, "Id inválido", idError.message);

        const { error, value } = solicitudAsistenciaResolverValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const [resultado, err] = await SolicitudAsistenciaService.resolverSolicitud(
            idValue.id_solicitud, value.decision, req.user.id_usuario
        );
        if (err) return handleErrorClient(res, 400, "No se pudo resolver la solicitud", err);

        return handleSuccess(res, 200, "Solicitud resuelta", resultado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
};