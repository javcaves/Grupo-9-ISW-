import * as CategoriasService from './categorias.service.js';


//obtener todas las categorias
export const listarTodas = async(req, res) =>{
    try {
        const lista = await CategoriasService.obtenerTodasCat();
        return sendResponse(res, 200, lista);
    } catch (error){
        return sendResponse(res, 500, {
            success: false,
            message: "error al obtener lista"
        });
    }
};

//obtener solo categorias activas
export const listarActivas = async(req, res) =>{
    try{
        const lista = await CategoriasService.obtenerTodasActivas();
        return sendResponse(res, 200, lista);
    }catch (error){
        return sendResponse(res, 500, {
            success: false,
            message: "error al obtener lista"
        });
    }
}

//obtener categoria por id
export const CatPorId = async(req, res) =>{
    try{
        const { id } = req.params;
        const categoria = await CategoriasService.obtenerCatPorId(id);
        return sendResponse(res, 200, categoria);
    }catch (error){
        return sendResponse(res, error.status || 500, {
            success: false,
            message: error.message //crear mensaje en json
        });
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
        return sendResponse(res, error.status || 500, {
            success: false,
            message: error.message
        });
    }
};

//actualizar categoria
export const actualizarCatC = async(req, res)=>{
    try{
        //defino el id del usuario
        const usuarioId = req.body.usuarioId || req.user?.id;
        const catActualizada = await CategoriasService.actualizarCat({ id }, usuarioId);
        return sendResponse(res, 200, catActualizada);
    }catch (error){
        return sendResponse(res, error.status || 500,{
            success: false,
            message: error.message
        });
    }
};

//buscar 
export const buscarCatC = async(req,res)=>{
    try{
        const { q } = req.query;
        if(!q){
            return sendResponse(res, 400, "se requiere un término de busqueda (q)")
        };
        const resultados = await CategoriasService.buscarDinamicoCat(q);
        return sendResponse(res, 200, resultados);
    }catch (error){
        return sendResponse(res, 500,{
            success: false,
            message: error.message
        });
    }
};

/*********desactivar o eliminar*********/
export const desactivarCatC = async(req, res)=>{
    try{
        const { id } = req.params;
        const catDesactivada = await CategoriasService.desactivarCat({ id });
        return sendResponse(res, 200, catDesactivada);
    }catch (error){
        return sendResponse(res, error.status || 500, {
            success: false,
            message: error.message
        });
    }
};