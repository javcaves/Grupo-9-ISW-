import passport from "passport";
import { AppDataSource } from "../config/ConfigDB.js";
import { handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";

export function authenticateJwt(req, res, next) {
    passport.authenticate("jwt", { session: false }, async (err, user, info) => {
        if (err) {
            return handleErrorServer(res, 500, "Error de autenticación en el servidor", err.message);
        }
        if (!user) {
            return handleErrorClient(res, 401, "No tienes permiso para acceder a este recurso", info ? info.message : "No se encontró el usuario");
        }

        // NUEVO: si la cuenta fue desactivada (soft-delete) mientras tenía
        // sesión abierta, su cookie JWT sigue válida hasta 1 día. Acá la
        // invalidamos en el acto: cuenta inactiva o inexistente => 401.
        try {
            const usuarioRepo = AppDataSource.getRepository("Usuario");
            const id = user.id_usuario ?? user.id;
            const actual = await usuarioRepo.findOne({
                select: { id_usuario: true, activo: true, rol: true },
                where: { id_usuario: id },
            });

            if (!actual || actual.activo === false) {
                res.clearCookie("jwt", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
                });
                return handleErrorClient(res, 401, "Sesión finalizada", "Tu cuenta fue desactivada. Inicia sesión nuevamente.");
            }

            req.user = user;
            next();
        } catch (e) {
            return handleErrorServer(res, 500, "Error de autenticación en el servidor", e.message);
        }
    })(req, res, next);
}