import { categoriaCreateValidation, categoriaUpdateValidation } from "./categoria.validation.js";
import * as CategoriaService from "./categoria.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";

// ----- Listar -----
export const listarCategorias = async (req, res) => {
    try {
        const lista = await CategoriaService.obtenerTodas();
        return handleSuccess(res, 200, "Categorías obtenidas", lista);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

//Obtener por ID
export const obtenerCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const [categoria, err] = await CategoriaService.obtenerPorId(id);
        if (err) return handleErrorClient(res, 404, "No encontrado", err);
        return handleSuccess(res, 200, "Éxito", categoria);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

// ----- Registro -----
export const registrarCategoria = async (req, res) => {
    try {
        const { error, value } = categoriaCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);

        const [nueva, err] = await CategoriaService.crearCategoria(value);
        if (err) return handleErrorClient(res, 400, "Error de negocio", err);
        return handleSuccess(res, 201, "Categoría creada", nueva);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

// ----- Actualizar -----
export const actualizarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = categoriaUpdateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Datos inválidos", error.message);
        
        if (Object.keys(value).length === 0) return handleErrorClient(res, 400, "Error", "Debe enviar datos para actualizar");

        const [actualizada, err] = await CategoriaService.actualizarCategoria(id, value);
        if (err) return handleErrorClient(res, 400, "Error", err);
        return handleSuccess(res, 200, "Categoría actualizada", actualizada);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

// ----- Eliminar -----
export const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado, err] = await CategoriaService.eliminarCategoria(id);
        if (err) return handleErrorClient(res, 400, "Denegado", err);
        return handleSuccess(res, 200, "Éxito", resultado);
    } catch (error) { return handleErrorServer(res, 500, "Error", error.message); }
};

// ----- Reactivar -----
export const reactivarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado, err] = await CategoriaService.reactivarCategoria(id);
        
        if (err) return handleErrorClient(res, 400, "Operación denegada", err);
        return handleSuccess(res, 200, "Éxito", resultado);
    } catch (error) { 
        return handleErrorServer(res, 500, "Error", error.message); 
    }
};