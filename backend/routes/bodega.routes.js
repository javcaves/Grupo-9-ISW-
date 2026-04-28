import { Router } from "express";
import * as InventarioCtrl from "../src/modules/bodega/inventario/inventario.controller.js";

const router = Router();

router.use('/inventario', InventarioCtrl);

export default router;
