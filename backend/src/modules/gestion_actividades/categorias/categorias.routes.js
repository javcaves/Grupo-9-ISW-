import { Router } from "express";
import * as CategoriasCtrl from './categorias.controller.js';

const router = Router();

//rutas de lectura******
router.get('/', CategoriasCtrl.listarTodas); //obtener todas las categorias 
router.get('/activas', CategoriasCtrl.listarActivas); //obtener solo categorias activas
router.get('/buscar', CategoriasCtrl.buscarCatC); //buscar categoria por nombre o descripcion

//rutas de escritura*****
router.get('/crear', CategoriasCtrl.crearCategoriaC); //crear categoria nueva
router.get('/actualizar', CategoriasCtrl.actualizarCatC); //editar categoria existente

//rutas de eliminacion (solo eliminacion soft)*****
router.get('/:id', CategoriasCtrl.desactivarCatC); //desactivar categoria

export default router;