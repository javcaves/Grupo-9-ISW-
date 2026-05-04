import jsonDbHandler from '../../../shared/jsonDbHandler.js';

const FOLDER = 'recursos_humanos';
const FILE_DICCIONARIO = 'powers.json'; // Estático
const FILE_ASIGNACIONES = 'usuario_power.json'; // Dinámico

// ################# LECTURA (Todos pueden ver) #################

/**
 * Obtiene el catálogo de poderes disponibles (El diccionario)
 * Nadie puede crear/editar/eliminar aquí.
 */
export const obtenerCatalogo = async () => {
    return await jsonDbHandler.leer(FOLDER, FILE_DICCIONARIO) || [];
};

/**
 * Obtiene los poderes activos de un usuario
 */
export const obtenerPoderesDeUsuario = async (idUsuario) => {
    const asignaciones = await jsonDbHandler.leer(FOLDER, FILE_ASIGNACIONES) || [];
    return asignaciones.filter(asig => asig.id_usuario === parseInt(idUsuario) && asig.activo === true);
};

// ################# VALIDACIÓN (La "Policía" del sistema) #################

/**
 * Verifica si el usuario tiene un poder específico.
 * Se usa en los Middlewares de las rutas.
 */
export const tienePermiso = async (idUsuario, codPower) => {
    const misPowers = await obtenerPoderesDeUsuario(idUsuario);
    return misPowers.some(p => p.id_power === codPower);
};

// ################# ESCRITURA (Gestión de Linaje) #################

/**
 * Regla: Un Admin solo otorga lo que tiene.
 * Regla: Se registra quién otorgó y en qué fecha.
 */
export const asignarPoderes = async (idDestino, listaCodigosPower, ejecutor) => {
    const asignaciones = await jsonDbHandler.leer(FOLDER, FILE_ASIGNACIONES) || [];
    const catalogo = await obtenerCatalogo();

    // 1. REGLA DE HERENCIA: Si no es ROOT, validamos que el ejecutor tenga esos poderes
    if (ejecutor.cargo !== 'ROOT') {
        const misPowers = await obtenerPoderesDeUsuario(ejecutor.id);
        const misCodigos = misPowers.map(p => p.id_power);

        const esValido = listaCodigosPower.every(cod => misCodigos.includes(cod));
        if (!esValido) {
            throw Object.assign(new Error("No puedes otorgar poderes que no posees."), { status: 403 });
        }
    }

    // 2. VALIDACIÓN DE EXISTENCIA: ¿Esos códigos existen en el powers.json?
    const existenEnCatalogo = listaCodigosPower.every(cod => 
        catalogo.some(c => c.id_power === cod)
    );
    if (!existenEnCatalogo) {
        throw Object.assign(new Error("Uno o más poderes no existen en el catálogo maestro."), { status: 400 });
    }

    // 3. LIMPIEZA PREVIA: Desactivamos poderes anteriores del usuario destino
    // (Para cumplir con la edición de poderes del punto 3 de tus reglas)
    const listaLimpia = asignaciones.map(asig => {
        if (asig.id_usuario === parseInt(idDestino)) {
            return { ...asig, activo: false };
        }
        return asig;
    });

    // 4. CREACIÓN: Insertamos los nuevos registros con el ID del ejecutor como padre
    const nuevasAsignaciones = listaCodigosPower.map(cod => ({
        id_asignacion: Date.now() + Math.floor(Math.random() * 1000),
        id_usuario: parseInt(idDestino),
        id_power: cod,
        otorgado_por_id: ejecutor.id, // LINAJE
        fecha_asignacion: new Date().toISOString(),
        activo: true
    }));

    await jsonDbHandler.escribir(FOLDER, FILE_ASIGNACIONES, [...listaLimpia, ...nuevasAsignaciones]);
    
    return { success: true, mensaje: "Poderes actualizados correctamente" };
};

/**
 * REGLA 2: Cuando un admin es eliminado, sus poderes pasan a SIN_ASIGNAR (Activo: False)
 */
export const revocarPoderesPorEliminacion = async (idUsuario) => {
    const asignaciones = await jsonDbHandler.leer(FOLDER, FILE_ASIGNACIONES) || [];
    
    const actualizados = asignaciones.map(asig => {
        if (asig.id_usuario === parseInt(idUsuario)) {
            return { ...asig, activo: false };
        }
        return asig;
    });

    await jsonDbHandler.escribir(FOLDER, FILE_ASIGNACIONES, actualizados);
};