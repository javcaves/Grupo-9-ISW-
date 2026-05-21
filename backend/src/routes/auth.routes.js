import { Router } from "express";
import { login, logout } from "../middlewares/auth.controller.js";

const router = Router();

// Rutas base: /api/auth/...
router.post("/login", login);
router.post("/logout", logout);

export default router;