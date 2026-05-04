/**
 * Esquemas de validación para el módulo de Turnos
 */

/**
 * Valida la creación de un turno
 * Verifica formato de horas y campos obligatorios
 */
export const validarCreacionTurno = (req, res, next) => {
    const { id_proyecto, hora_ingreso, hora_salida, descripcion } = req.body;
    const errores = [];

    // Validar ID Proyecto
    if (!id_proyecto || typeof id_proyecto !== 'number') {
        errores.push("El id_proyecto es obligatorio y debe ser un número.");
    }

    // Validar Formato de Horas (HH:mm)
    const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
    
    if (!hora_ingreso || !regexHora.test(hora_ingreso)) {
        errores.push("La hora_ingreso es obligatoria y debe tener formato HH:mm (00:00 - 23:59).");
    }

    if (!hora_salida || !regexHora.test(hora_salida)) {
        errores.push("La hora_salida es obligatoria y debe tener formato HH:mm (00:00 - 23:59).");
    }

    if (!descripcion || descripcion.trim().length < 3) {
        errores.push("La descripción debe tener al menos 3 caracteres.");
    }

    if (errores.length > 0) {
        return res.status(400).json({ success: false, errores });
    }

    next();
};

/**
 * Valida la asignación masiva de empleados a un turno
 */
export const validarAsignacionEmpleados = (req, res, next) => {
    const { empleados } = req.body;

    if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
        return res.status(400).json({
            success: false,
            error: "Debe proporcionar un array 'empleados' con al menos un registro."
        });
    }

    const errores = [];
    const regexFecha = /^\d{4}-\d{2}-\d{2}/; // Formato básico YYYY-MM-DD

    empleados.forEach((emp, index) => {
        if (!emp.id_empleado || typeof emp.id_empleado !== 'number') {
            errores.push(`Empleado en índice ${index}: id_empleado inválido.`);
        }
        if (!emp.fecha_ingreso || !regexFecha.test(emp.fecha_ingreso)) {
            errores.push(`Empleado en índice ${index}: fecha_ingreso inválida o ausente.`);
        }
    });

    if (errores.length > 0) {
        return res.status(400).json({ success: false, errores });
    }

    next();
};

/**
 * Valida parámetros de URL (IDs numéricos)
 */
export const validarIdsParams = (req, res, next) => {
    const params = req.params;
    const errores = [];

    for (const key in params) {
        if (isNaN(parseInt(params[key]))) {
            errores.push(`El parámetro ${key} debe ser un número válido.`);
        }
    }

    if (errores.length > 0) {
        return res.status(400).json({ success: false, errores });
    }

    next();
};