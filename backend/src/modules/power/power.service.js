import { AppDataSource } from '../../config/ConfigDB.js';

const powerRepository = AppDataSource.getRepository('Power');
const PowerUsuarioRepository = AppDataSource.getRepository('PowerUsuario');
const usuarioRepository = AppDataSource.getRepository('Usuario');


export const obtenerCatalogo = async () => {
    try{
        const catalogo = await powerRepository.find({
            where: {activo: true},
            order: {id_power: 'ASC'}
        });
        return [catalogo, null];
    }catch(error){
        return[null, error.message];
    }
};

/**
 * Obtiene los poderes activos de un usuario
 */
export const obtenerPoderesDeUsuario = async (idUsuario) => {
    try{
        const poderes = PowerUsuarioRepository.find({
            where: { id_usuario: parseInt(idUsuario), activo: true},
            relations: ['power']
        });


        const poderesFormat = poderes.map(p =>({
            id_asignacion: p.id_asignacion,
            id_power: p.id_power,
            nombre: p.power?.nombre,
            descripcion: p.power?.descripcion,
            otorgado_por_id: p.otorgado_por_id,
            fecha_asignacion: p.fecha_asignacion
        }));

        return [poderesFormat, null];
    }catch(error){
        return[null, error.message];
    }
};

// ################# VALIDACIÓN (La "Policía" del sistema) #################

/**
 * Verifica si el usuario tiene un poder específico.
 * Se usa en los Middlewares de las rutas.
 */
export const tienePermiso = async (idUsuario, codPower) => {
    try{
        const permiso = await PowerUsuarioRepository.findOne({
            where:{ id_usuario: parseInt(idUsuario), id_power: codpower, activo: true}
        });

        return [!!permiso, null];
    }catch(error){
        return[null, error.message];
    }
};

// ################# ESCRITURA (Gestión de Linaje) #################

/**
 * Regla: Un Admin solo otorga lo que tiene.
 * Regla: Se registra quién otorgó y en qué fecha.
 */
export const asignarPoderes = async (idDestino, listaCodigosPower, ejecutor) => {
    try{
        if(ejecutor.cargo !== 'ROOT'){
            for(const cod of listaCodigosPower){
                const [tiene, err] = await tienePermiso(ejecutor.id, cod);
                if(err || !tiene){
                    throw new Error(`no puedes otorgar el poder ${cod} porque no lo posees`);
                }
            }
        }

        await PowerUsuarioRepository.update(
            {id_usuario: parseInt(idUsuario), activo: true},
            {activo: false}
        );

        const nuevas_asignaciones = listaCodigosPower.map(cod =>({
            id_usuario: parseInt(idDestino),
            id_power: cod,
            otorgado_por_id: ejecutor.id,
            fecha_asignacion: new Date(),
            activo: true
        }));

        const guardados = await PowerUsuarioRepository.save(nuevas_asignaciones);
        return[{message: 'poderes asignados de forma exitosa', data: guardados}, null];
    }catch(error){
        return[null, error.message];
    }
};

/**
 * REGLA 2: Cuando un admin es eliminado, sus poderes pasan a SIN_ASIGNAR (Activo: False)
 */
export const revocarPoderesPorEliminacion = async (idUsuario) => {
    try{
        await PowerUsuarioRepository.update(
            {id_usuario: parseInt(idUsuario), activo: true},
            {activo: false}
        );

        return[true, null];
    }catch(error){
        return[null, error.message];
    }
};