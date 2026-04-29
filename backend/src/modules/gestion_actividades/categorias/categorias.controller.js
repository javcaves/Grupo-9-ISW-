import * as CategoriasService from './categorias.service.js';

/**
 * Helper para estandarizar respuestas
 */
const sendResponse = (res, status, data) => {
    return res.status(status).json(data);
};

// obtener todas las categorias
export const listarTodas = async (req, res) => {
    try {
        const lista = await CategoriasService.obtenerTodasCat();
        return sendResponse(res, 200, lista);
    } catch (error) {
        return sendResponse(res, 500, {
            success: false,
            message: "Error al obtener lista"
        });
    }
};

// obtener solo categorias activas
export const listarActivas = async (req, res) => {
    try {
        const lista = await CategoriasService.obtenerTodasActivas();
        return sendResponse(res, 200, lista);
    } catch (error) {
        return sendResponse(res, 500, {
            success: false,
            message: "Error al obtener lista de activos"
        });
    }
}

// obtener categoria por id
export const CatPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await CategoriasService.obtenerCatPorId(id);
        return sendResponse(res, 200, categoria);
    } catch (error) {
        return sendResponse(res, error.status || 500, {
            success: false,
            message: error.message
        });
    }
}

// crear categoria
export const crearCategoriaC = async (req, res) => {
    try {
        const usuarioId = req.body.usuarioId;

        if (!usuarioId) {
            return sendResponse(res, 401, {
                success: false,
                message: "Se necesita ingresar usuario para crear categoría"
            });
        }

        const categoriaNueva = await CategoriasService.crearCategoria(req.body, usuarioId);
        return sendResponse(res, 201, categoriaNueva);

    } catch (error) {
        return sendResponse(res, error.status || 500, {
            success: false,
            message: error.message
        });
    }
};

// actualizar categoria
export const actualizarCatC = async (req, res) => {
    try {
        const { id } = req.params; // ERROR CORREGIDO: Debes extraer el id de params
        const usuarioId = req.body.usuarioId || req.user?.id;

        if (!usuarioId) {
            return sendResponse(res, 401, { success: false, message: "Usuario no identificado" });
        }

        // ERROR CORREGIDO: El service espera (id, data, usuarioId)
        const catActualizada = await CategoriasService.actualizarCat(id, req.body, usuarioId);
        
        return sendResponse(res, 200, catActualizada);
    } catch (error) {
        return sendResponse(res, error.status || 500, {
            success: false,
            message: error.message
        });
    }
};

// buscar 
export const buscarCatC = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return sendResponse(res, 400, { success: false, message: "Se requiere un término de búsqueda (q)" });
        };
        const resultados = await CategoriasService.buscarDinamicoCat(q);
        return sendResponse(res, 200, resultados);
    } catch (error) {
        return sendResponse(res, 500, {
            success: false,
            message: error.message
        });
    }
};

// desactivar categoria
export const desactivarCatC = async (req, res) => {
    try {
        const { id } = req.params;
        
        // ERROR CORREGIDO: Tu service espera el ID directo, no un objeto {id}
        const catDesactivada = await CategoriasService.desactivarCat(id);
        
        return sendResponse(res, 200, catDesactivada);
    } catch (error) {
        return sendResponse(res, error.status || 500, {
            success: false,
            message: error.message
        });
    }
};