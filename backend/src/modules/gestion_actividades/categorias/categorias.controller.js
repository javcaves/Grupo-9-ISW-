import * as CategoriasService from './categorias.service.js';


//obtener todas las categorias
export const listarTodas = async(req, res) =>{
    try {
        const lista = await CategoriasService.obtenerTodasCat();
        return sendResponse(res, 200, lista);
    } catch (error){
        return sendResponse(res, 500, "error al obtener lista completa");
    }
};

//obtener solo categorias activas
export const listarActivas = async(req, res) =>{
    try{
        const lista = await CategoriasService.obtenerTodasActivas();
        return sendResponse(res, 200, lista);
    }catch (error){
        return sendResponse(res, 500, "error al obtener lista de categorias activas");
    }
}

//obtener categoria por id
export const CatPorId = async(req, res) =>{
    try{
        const { id } = req.params;
        const categoria = await CategoriasService.obtenerCatPorId(id);
        return sendResponse(res, 200, categoria);
    }catch (error){
        return sendResponse(res, error.status || 500, "error al obtener categorias por id");
    }
}

//registrar categoria
export const 