import { Router } from "express";
import { login, logout } from "../middlewares/auth.controller.js";
import { authenticateJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas base: /api/auth/...
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticateJwt, (req, res) => {
    return res.json({
        success: true,
        user: {
            id_usuario: req.user.id_usuario,
            nombre: req.user.nombre,
            rol: req.user.rol
        }
    });
});



export default router;
