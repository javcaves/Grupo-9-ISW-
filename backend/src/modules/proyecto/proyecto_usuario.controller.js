import {
    obtenerUsuariosDelProyecto as obtenerUsuariosService,
    asignarUsuarioAProyecto as asignarUsuarioService,
    desvincularUsuarioDeProyecto as desvincularUsuarioService,
} from './proyecto_usuario.service.js';

import {
    proyecto_usuarioAsignarValidation,
    proyecto_usuarioDeactivateValidation,
    proyecto_usuarioUpdateRolValidation,
    proyecto_usuarioIdValidation,
} from './proyecto_usuario.validations.js';

import { handleSuccess, handleErrorClient, handleErrorServer } from '../../handlers/responseHandlers.js';

// ── GET ───────────────────────────────────────────────────────────────────────
export const obtenerUsuariosDelProyecto = async (req, res) => {
    try {
        const { error: idError, value: idValue } = proyecto_usuarioIdValidation.validate(req.params);
        if (idError) return handleErrorClient(res, 400, 'error, id inválido', idError.message);

        const { error, value } = proyecto_usuarioUpdateRolValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, 'error de validación', error.message);

        const [usuarios, err] = await obtenerUsuariosService(idValue.idProyecto, value);
        if (err) return handleErrorClient(res, 400, 'error al obtener usuarios', err);

        return handleSuccess(res, 200, 'usuarios obtenidos de forma exitosa', usuarios);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

// ── POST ──────────────────────────────────────────────────────────────────────
export const asignarUsuarioAProyecto = async (req, res) => {
    try {
        const { error: idError, value: idValue } = proyecto_usuarioIdValidation.validate(req.params);
        if (idError) return handleErrorClient(res, 400, 'error, id inválido', idError.message);

        const { error, value } = proyecto_usuarioAsignarValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, 'error de validación', error.message);

        const [asignacion, err] = await asignarUsuarioService(idValue.idProyecto, value, req.user);
        if (err) return handleErrorClient(res, 400, 'error al asignar usuario', err);

        return handleSuccess(res, 201, 'usuario asignado de forma exitosa', asignacion);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
export const desvincularUsuarioDeProyecto = async (req, res) => {
    try {
        const { error, value } = proyecto_usuarioIdValidation.validate(req.params);
        if (error) return handleErrorClient(res, 400, 'error de validación', error.message);

        const [resultado, err] = await desvincularUsuarioService(value.idProyecto, value.idUsuario, req.user);
        if (err) return handleErrorClient(res, 403, 'error al desvincular', err);

        return handleSuccess(res, 200, 'usuario desvinculado del proyecto de forma exitosa', resultado);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    }
};