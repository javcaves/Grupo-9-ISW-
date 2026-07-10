/**
 * @typedef {Object} Empleado
 * @property {number} id - Identificador único autoincremental
 * @property {string} rut - RUT normalizado (sin puntos, con guion y Mayúscula)
 * @property {string} nombre - Nombres del empleado
 * @property {string} apellido - Apellidos del empleado
 * @property {string} observacion - Observacion sobre el empleado
 * @property {string} correo - Email vinculado
 * @property {string} rol - Rol en la empresa
 * @property {date} fecha_ingreso - Fecha de ingreso a la empresa
 * @property {number} numero - Número de contacto
 * @property {boolean} activo - Estado de la cuenta (Soft Delete)
 */
import { AppDataSource } from '../../config/ConfigDB.js';
import { ILike } from 'typeorm';
import bcrypt from "bcrypt";
import * as NotificacionService from '../notificaciones/notificacion.service.js';

//obtener usuario por query (id o rut)
/*
export async function getUsuarioService(query) {
    try{
        const usuarioRepository = AppDataSource.getRepository("Usuario");
        const {id_usuario, rut} = query;

        const queryBuilder = usuarioRepository.createQueryBuilder("usuario");

        if(id_usuario){
            queryBuilder.where("usuario.id_usuario = :id_usuario", { id_usuario });
        } else if (rut){
            queryBuilder.where("usuario.rut = :rut", { rut });
        } else{
            return[null, "debe proporcionar id o rut de usuario"];
        }

        const usuario = await queryBuilder.getOne();

        if(!usuario){
            return[null, "usuario no encontrado"];
        }

        return[usuario, null];
    } catch(error){
        console.log("error en getUsuarioService", error);
        return[null, "error interno del servidor"];
    }
    
};*/

//crear**************
export const crearUsuario = async(data, ejecutor)=>{
    try{
        const usuarioRepository = AppDataSource.getRepository("Usuario");
        const existe = await usuarioRepository.findOne({
            where: { rut: data.rut }
        });
        if(existe) throw new Error('el rut ingresado ya existe');

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        const nuevoUsuario = usuarioRepository.create({
            ...data,
            password: hashedPassword,
            creado_por: ejecutor.id_usuario,
            activo: true,
            fecha_registro: new Date()
        });

        const guardado = await usuarioRepository.save(nuevoUsuario);
        delete guardado.password;
        return [guardado, null];

    }catch(error){
        console.error("error en crearUsuarioService", error);
        return[null, error.message];
    }
}
//busqueda**************
export const obtenerTodosActivos = async (filtros = {}) => {
    try {
        const userRepo = AppDataSource.getRepository("Usuario");
        const puRepo   = AppDataSource.getRepository("ProyectoUsuario");

        const baseWhere = { activo: true };
        if (filtros.rol) baseWhere.rol = filtros.rol;
        if (filtros.rut) baseWhere.rut = ILike(`%${filtros.rut}%`);

        const where = filtros.nombre
            ? [
                { ...baseWhere, nombre:   ILike(`%${filtros.nombre}%`) },
                { ...baseWhere, apellido: ILike(`%${filtros.nombre}%`) },
              ]
            : baseWhere;

        const usuarios = await userRepo.find({ where });

        // Conteo de proyectos EN_CURSO por usuario, uniendo hasta la tabla proyecto
        const conteos = await puRepo
            .createQueryBuilder("pu")
            .innerJoin("proyecto", "p", "p.id_proyecto = pu.id_proyecto")
            .select("pu.id_usuario", "id_usuario")
            .addSelect("COUNT(DISTINCT pu.id_proyecto)", "total")
            .where("pu.activo = true")
            .andWhere("p.estado = :estado", { estado: "EN_CURSO" })
            .groupBy("pu.id_usuario")
            .getRawMany();

        const mapaConteos = new Map(
            conteos.map((c) => [Number(c.id_usuario), Number(c.total)])
        );

        const resultados = usuarios.map((u) => {
            delete u.password;
            return {
                ...u,
                proyectos_en_curso: mapaConteos.get(u.id_usuario) ?? 0,
            };
        });

        return [resultados, null];
    } catch (error) {
        console.log("error en obtenerTodosActivos", error);
        return [null, "error interno del servidor"];
    }
};

export const obtenerUsuarioPorID = async(id) => {
        try{
            const userRepo = AppDataSource.getRepository("Usuario");
            const usuario = await userRepo.findOne({
                where: { id_usuario: parseInt(id) }
            });
            if(!usuario) throw new Error('usuario no encontrado');
            delete usuario.password;
            return[usuario, null];
        }catch(error){
            console.log("error en obtenerUsuarioPorID", error);
            return[null, "error interno del servidor"];
        }
    };

//actualizar ****************+
export const actualizarUsuario = async(id, data, ejecutor) =>{
        try{
            const usuarioRepository = AppDataSource.getRepository("Usuario");
            const usuario = await usuarioRepository.findOne({
                where: { id_usuario: parseInt(id) }
            });
            if(!usuario) throw new Error('usuario no encontrado');

            if(data.rol === 'ROOT' && ejecutor.rol !== 'ROOT'){
                throw new Error('solo ROOT puede asignar el rol ROOT');
            }

            Object.assign(usuario, data);
            usuario.fecha_actualizacion = new Date();

            const actualizado = await usuarioRepository.save(usuario);
            return [actualizado, null];

        }catch(error){
            console.log("error en actualizarUsuario", error);
            return[null, "error interno del servidor"];
        }
    };

//softdelete********
export const eliminarUsuarioService = async(id, ejecutor) =>{
        try{
            const usuarioRepository = AppDataSource.getRepository("Usuario");
            const usuario = await usuarioRepository.findOne({
                where: { id_usuario: parseInt(id) }
            });
            if(!usuario) throw new Error('usuario no encontrado');

            if (usuario.rol === 'ROOT') throw new Error('ROOT es intocable');

            if(ejecutor.rol === 'ADMIN' && usuario.creado_por !== ejecutor.id_usuario){
                throw new Error('solo puedes eliminar usuarios que tu mismo creaste');
            }

            usuario.activo = false;
            usuario.rol = "SIN_ASIGNAR";
            usuario.fecha_actualizacion = new Date();

            await usuarioRepository.save(usuario);
            return [{message: 'usuario eliminado con exito'}, null];

        }catch(error){
            console.log("error en eliminarUsuarioService", error);
            return[null, "error interno del servidor"];
        }
    };

/**
 * Asigna una contraseña provisional (ej. el usuario la olvidó y pidió
 * recuperarla). Marca como resueltas todas las notificaciones
 * SOLICITUD_PASSWORD de este usuario -- sin importar cuál admin las vio,
 * ya que la acción real la puede ejecutar cualquier ADMIN/SUPERVISOR/ROOT.
 * No se genera ninguna notificación de vuelta (gestión fuera del sistema).
 */
// Cambio de contraseña por el propio usuario (requiere validar la actual)
export const cambiarMiPassword = async (id_usuario, passwordActual, passwordNueva) => {
    try {
        const usuarioRepository = AppDataSource.getRepository("Usuario");
        
        const usuario = await usuarioRepository.findOne({
            select: { id_usuario: true, password: true },
            where: { id_usuario: parseInt(id_usuario) },
        });
        if (!usuario) throw new Error("Usuario no encontrado.");

        const coincide = await bcrypt.compare(passwordActual, usuario.password);
        if (!coincide) throw new Error("La contraseña actual no es correcta.");

        const saltRounds = 10;
        usuario.password = await bcrypt.hash(passwordNueva, saltRounds);
        usuario.fecha_actualizacion = new Date();
        await usuarioRepository.save(usuario);

        return [{ message: "Contraseña actualizada con éxito." }, null];
    } catch (error) {
        console.log("error en cambiarMiPassword", error);
        return [null, error.message || "error interno del servidor"];
    }
};

export const resetearPasswordUsuario = async (id_usuario, nuevaPassword) => {
    try {
        const usuarioRepository = AppDataSource.getRepository("Usuario");
        const usuario = await usuarioRepository.findOne({ where: { id_usuario: parseInt(id_usuario) } });
        if (!usuario) throw new Error("usuario no encontrado");

        const saltRounds = 10;
        usuario.password = await bcrypt.hash(nuevaPassword, saltRounds);
        usuario.fecha_actualizacion = new Date();
        await usuarioRepository.save(usuario);

        const [, errNotif] = await NotificacionService.marcarResueltasPorReferencia({
            tipo_referencia: "USUARIO",
            id_referencia: usuario.id_usuario,
            tipo: "SOLICITUD_PASSWORD",
        });
        if (errNotif) console.error("error al marcar solicitudes de password resueltas:", errNotif);

        return [{ message: "Contraseña provisional asignada con éxito." }, null];
    } catch (error) {
        console.log("error en resetearPasswordUsuario", error);
        return [null, error.message || "error interno del servidor"];
    }
};