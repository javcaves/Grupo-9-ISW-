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
            rut: req.user.rut,
            nombre: req.user.nombre,
            apellido: req.user.apellido,
            email: req.user.email,
            numero: req.user.numero,
            rol: req.user.rol,
            fecha_ingreso: req.user.fecha_ingreso,
            activo: req.user.activo
        }
    });
});



export default router;
