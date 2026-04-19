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

//crear categoria
export const crearCategoriaC = async(req, res)=>{
    try{
        const usuarioId = req.body.usuarioId;

        if(!usuarioId){
            const error = new Error("se necesita ingresar usuario para crear categoria");
            error.status = 401;
            throw error;
        }

        const categoriaNueva = await CategoriasService.crearCategoria(req.body, usuarioId);

        return sendResponse(res, 201, categoriaNueva);

    } catch (error){
        return sendResponse(res, error.status || 500, "no se pudo crear la categoria");
    }
};

//actualizar categoria
export const actualizarCatC = async(req, res)=>{
    try{
        const { id } = req.params;
        const catActualizada = await CategoriasService.actualizarCat(req.body, usuarioId);
        return sendResponse(res, 200, catActualizada);
    }catch (error){
        return sendResponse(res, error.status || 500, "no se pudo actualizar la categoria");
    }
};

/*********desactivar o eliminar*********/
