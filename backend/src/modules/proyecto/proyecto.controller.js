import * as ProyectoService from './proyecto.service.js';

/**
 * 1. Crear nuevo proyecto (Solo Admin/Root)
 * POST /proyectos
 */
export const crearProyecto = async (req, res) => {
    try {
        const datos = req.body;
        const ejecutor = req.user; // Extraído del middleware de autenticación

        const nuevoProyecto = await ProyectoService.crearProyecto(datos, ejecutor);

        return res.status(201).json({
            success: true,
            message: "Proyecto creado y personal asignado correctamente.",
            data: nuevoProyecto
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * 2. Editar proyecto (Solo Admin/Root)
 * PUT /proyectos/:id
 */
export const editarProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;
        const ejecutor = req.user;

        const proyectoEditado = await ProyectoService.editarProyecto(id, datos, ejecutor);

        return res.status(200).json({
            success: true,
            message: "Proyecto actualizado correctamente.",
            data: proyectoEditado
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Obtener lista de proyectos según el rol
 * GET /proyectos
 */
export const obtenerMisProyectos = async (req, res) => {
    try {
        const usuario = req.user;
        const proyectos = await ProyectoService.obtenerProyectosPorUsuario(usuario);

        return res.status(200).json({
            success: true,
            data: proyectos
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Error al recuperar la lista de proyectos."
        });
    }
};

/**
 * Obtener detalle de personal de un proyecto específico
 * GET /proyectos/:id/personal
 */
export const obtenerPersonalProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        const personal = await ProyectoService.obtenerPersonalProyecto(id);

        return res.status(200).json({
            success: true,
            data: personal
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error: error.message
        });
    }
};