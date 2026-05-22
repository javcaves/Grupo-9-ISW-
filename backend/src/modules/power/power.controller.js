import * as PowerService from './power.service.js';

import{
    powerQueryValidation,
    powerCreateValidation,
    powerUpdateValidation,
    powerIdValidation,
    usuarioIdValidation,
    asignarPowerValidation
} from './power.validations.js';

import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";

/**
 * Obtener el catálogo maestro de poderes (Diccionario estático)
 * GET /
 */
export const obtenerCatalogo = async (req, res) => {
    try {
        const [catalogo, err] = await PowerService.obtenerCatalogo();
        return res.status(200).json({
            success: true,
            data: catalogo
        });
        return handleSuccess(res, 200, 'catalogo de poderes', catalogo);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    } 
};

/**
 * Obtener los poderes que tiene asignados un usuario específico
 * GET /:idUsuario
 */
export const obtenerPoderesDeUsuario = async (req, res) => {
    try {
        const { error, value } = usuarioIdValidation.validate(req.params);
        if (error){
            return handleErrorClient(res, 400, 'error de validacion', error.message);
        }
        
        const [poderes, errPow]= await PowerService.obtenerPoderesDeUsuario(value.idUsuario);
        if (errPow){
            return handleErrorClient(res, 404, 'error al obtener poderes de usuario', error.message);
        }
        return handleSuccess(res, 200, 'poderes del usuario', poderes);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    } 
};

/**
 * Gestionar la asignación de poderes (Otorgar/Revocar)
 * POST /asignar/:idDestino
 * 
 * Nota: El esquema (power.schema.js) ya validó que req.body.powers sea un array de strings.
 */
export const gestionarAsignacion = async (req, res) => {
    try {
        const { idDestino } = req.params;
        const { error, value } = asignarPowerValidation.validate(req.body);
        const ejecutor = req.user; // Inyectado por middleware de Auth

        if (error){
            return handleErrorClient(res, 400, 'error de validacion', error.message);
        }

        // Delegamos la lógica de Linaje y Herencia al Service
        const [resultado, err] = await PowerService.asignarPoderes(idDestino, value.powers, ejecutor);

        if (err){
            return handleErrorClient(res, 403, 'error al asignar poderes', error.message);
        }
        
        return handleSuccess(res, 200, 'poderes asignados de forma exitosa', poderes);
    } catch (error) {
        return handleErrorServer(res, 500, 'error de servidor', error.message);
    } 
};

//FUNCNION PARA MIDDLEWARE VA EN EL MIDDLEWARE, NO ACÁ
/**
 * Middleware de Autorización por Poder
 * Se usa en las rutas para proteger endpoints específicos.
 */

/*
export const verificarPermiso = (codPower) => {
    return async (req, res, next) => {
        try {
            const usuario = req.user;

            // 1. El ROOT tiene pase libre total
            if (usuario.cargo === 'ROOT') return next();

            // 2. Verificamos si el usuario tiene el código en sus asignaciones activas
            const [tienePoder, err] = await PowerService.tienePermiso(usuario.id, codPower);
            
            if (err || !tienePoder) {
                return res.status(403).json({ 
                    error: `Privilegios insuficientes. Requiere el poder: [${codPower}]` 
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ error: "Error interno al verificar privilegios." });
        }
    };
};*/