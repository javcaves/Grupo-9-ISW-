import * as PowerService from './power.service.js';

/**
 * Obtener el catálogo maestro de poderes (Diccionario estático)
 * GET /
 */
export const obtenerCatalogo = async (req, res) => {
    try {
        const catalogo = await PowerService.obtenerCatalogo();
        return res.status(200).json({
            success: true,
            data: catalogo
        });
    } catch (error) {
        return res.status(500).json({ error: "Error al obtener el catálogo maestro." });
    }
};

/**
 * Obtener los poderes que tiene asignados un usuario específico
 * GET /:idUsuario
 */
export const obtenerPoderesDeUsuario = async (req, res) => {
    try {
        const { idUsuario } = req.params;
        const poderes = await PowerService.obtenerPoderesDeUsuario(idUsuario);
        
        return res.status(200).json({
            success: true,
            data: poderes
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
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
        const { powers } = req.body;
        const ejecutor = req.user; // Inyectado por middleware de Auth

        // Delegamos la lógica de Linaje y Herencia al Service
        const resultado = await PowerService.asignarPoderes(idDestino, powers, ejecutor);
        
        return res.status(200).json(resultado);
    } catch (error) {
        // Capturamos errores de jerarquía (403) o de catálogo (400) lanzados por el Service
        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Middleware de Autorización por Poder
 * Se usa en las rutas para proteger endpoints específicos.
 */
export const verificarPermiso = (codPower) => {
    return async (req, res, next) => {
        try {
            const usuario = req.user;

            // 1. El ROOT tiene pase libre total
            if (usuario.cargo === 'ROOT') return next();

            // 2. Verificamos si el usuario tiene el código en sus asignaciones activas
            const tienePoder = await PowerService.tienePermiso(usuario.id, codPower);
            
            if (!tienePoder) {
                return res.status(403).json({ 
                    error: `Privilegios insuficientes. Requiere el poder: [${codPower}]` 
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ error: "Error interno al verificar privilegios." });
        }
    };
};