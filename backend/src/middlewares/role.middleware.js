import { handleErrorClient } from '../handlers/responseHandlers.js';

export const checkRole = (rolesPermitidos) => {
    return (req, res, next) => {
        try {
            if (!req.user || !req.user.rol) {
                return handleErrorClient(res, 401, "Error de autenticación", "Rol de usuario no definido.");
            }

            const rolUsuario = req.user.rol;

            if (!rolesPermitidos.includes(rolUsuario)) {
                return handleErrorClient(res, 403, "Acceso denegado", `El rol '${rolUsuario}' no tiene los permisos necesarios.`);
            }

            next();
        } catch (error) {
            return handleErrorClient(res, 500, "Error de autorización", error.message);
        }
    };
};