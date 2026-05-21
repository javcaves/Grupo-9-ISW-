/**
 * Esquemas de validación para el módulo de Proyectos
 */

/**
 * Valida la creación de un nuevo proyecto
 */
export const validarCreacionProyecto = (req, res, next) => {
    const { 
        nombre_proy, 
        min_emp, 
        max_emp, 
        ubicacion, 
        fecha_inicio, 
        fecha_termino, 
        personalIds 
    } = req.body;
    
    const errores = [];
    const regexFecha = /^\d{4}-\d{2}-\d{2}/;

    // 1. Validaciones de Texto y Números
    if (!nombre_proy || nombre_proy.trim().length < 5) {
        errores.push("El nombre del proyecto es obligatorio y debe tener al menos 5 caracteres.");
    }

    if (typeof min_emp !== 'number' || typeof max_emp !== 'number' || min_emp > max_emp) {
        errores.push("Los límites de empleados son inválidos (min_emp no puede ser mayor a max_emp).");
    }

    if (!ubicacion || ubicacion.trim().length < 5) {
        errores.push("La ubicación es obligatoria.");
    }

    // 2. Validaciones de Fechas
    if (!fecha_inicio || !regexFecha.test(fecha_inicio)) {
        errores.push("La fecha_inicio es obligatoria y debe ser YYYY-MM-DD.");
    }

    if (fecha_termino && fecha_inicio && new Date(fecha_termino) <= new Date(fecha_inicio)) {
        errores.push("La fecha de término no puede ser anterior o igual a la fecha de inicio.");
    }

    // 3. Validación de Personal
    if (!personalIds || !Array.isArray(personalIds) || personalIds.length === 0) {
        errores.push("Debe asignar al menos un usuario (Encargado o Supervisor) al crear el proyecto.");
    }

    if (errores.length > 0) {
        return res.status(400).json({ success: false, errores });
    }

    next();
};

/**
 * Valida la edición de un proyecto existente
 */
export const validarEdicionProyecto = (req, res, next) => {
    const { estado, min_emp, max_emp } = req.body;
    const errores = [];
    const estadosValidos = ["EN_PREPARACION", "EN_CURSO", "FINALIZADO"];

    if (estado && !estadosValidos.includes(estado)) {
        errores.push(`Estado inválido. Los permitidos son: ${estadosValidos.join(', ')}`);
    }

    if (min_emp && max_emp && min_emp > max_emp) {
        errores.push("El mínimo de empleados no puede superar al máximo.");
    }

    if (errores.length > 0) {
        return res.status(400).json({ success: false, errores });
    }

    next();
};

/**
 * Valida parámetros de ID en la URL
 */
export const validarProyectoId = (req, res, next) => {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({
            success: false,
            error: "El ID del proyecto debe ser un número válido."
        });
    }
    next();
};