import { Router } from 'express';
import { hojaDeVidaController } from './hojaDeVida.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();

// ===HOJA DE VIDA GLOBAL===
//GET /api/hoja-vida/:idEmpleado
router.get("/:idEmpleado", 
    authenticateJwt, 
    checkRole(["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO"]), 
    hojaDeVidaController.obtenerHojaDeVida
);

// ===HOJA DE VIDA X PROYECTO===
//GET /api/hoja_de_vida/proyecto/:idProyecto/empleado/:idEmpleado
router.get("/proyecto/:idProyecto/empleado/:idEmpleado", 
    authenticateJwt, 
    checkRole(["ROOT", "ADMIN", "SUPERVISOR", "ENCARGADO"]), 
    hojaDeVidaController.obtenerHojaDeVidaPorProyecto
);

export default router;
