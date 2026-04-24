import { Router } from "express";
import * as InventarioCtrl from "./inventario.controller.js";

const router = Router();

router.use('/inventario', InventarioCtrl);

export default router;
