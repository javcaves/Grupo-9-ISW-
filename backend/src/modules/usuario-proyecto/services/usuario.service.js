/**
 * @typedef {Object} Empleado
 * @property {number} id - Identificador único autoincremental
 * @property {string} rut - RUT normalizado (sin puntos, con guion y Mayúscula)
 * @property {string} nombre - Nombres del empleado
 * @property {string} apellido - Apellidos del empleado
 * @property {string} observacion - Observacion sobre el empleado
 * @property {string} correo - Email vinculado
 * @property {string} cargo - Rol en la empresa
 * @property {date} fecha_ingreso - Fecha de ingreso a la empresa
 * @property {number} numero - Número de contacto
 * @property {boolean} activo - Estado de la cuenta (Soft Delete)
 */
import { AppDataSource } from '../../../config/ConfigDB.js';
import { ILike } from 'typeorm';
import { obtenerPorID } from '../../actividades/actividades.service.js';

//obtener usuario por query (id o rut)
const usuarioRepository = AppDataSource.getRepository("Usuario");
/*
export async function getUsuarioService(query) {
    try{
        const usuarioRepository = AppDataSource.getRepository(Usuario);
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
        const existe = await usuarioRepository.findOne({
            where: { rut: data.rut }
        });
        if(existe) throw new Error('el rut ingresado ya existe');

        const nuevoUsuario = usuarioRepository.create({
            ...data,
            creado_por: ejecutor.id_usuario,
            activo: true,
            fecha_registro: new Date()
        });

        const guardado = await usuarioRepository.save(nuevoUsuario);
        return [guardado, null];

    }catch(error){
        console.log("error en crearUsuarioService", error);
        return[null, "error interno del servidor"];
    }

//busqueda**************
    const obtenerTodosActivos = async () => {
        const userRepo = AppDataSource.getRepository("Usuario");
        return await userRepo.find({ 
            where: { activo: true }
        });
    };

    const obtenerUsuarioPorID = async(id) => {
        try{
            const userRepo = AppDataSource.usuarioRepository.findOne({
                where: {id: parseInt(id)}
            });
            if(!usuario) throw new Error('usuario no encontrado');
            return[userRepo, null];
        }catch(error){
            console.log("error en obtenerUsuarioPorID", error);
            return[null, "error interno del servidor"];
        };
    };

//actualizar ****************+
    export const actualizarUsuario = async(id, data, ejecutor) =>{
        try{
            const usuario = AppDataSource.usuarioRepository.findOne({
                where: {id: parseInt(id_usuario)}
            });
            if(!usuario) throw new Error('usuario no encontrado');

            if(data.rol === 'ROOT' && ejecutor.cargo !== 'ROOT'){
                throw new Error('solo ROOT puede asignar el rol ROOT');
            };

            Object.assign(usuario, data);
            usuario.fecha_actualizacion = new Date();

          const actualizado = await usuarioRepository.save(usuario);
          return [actualizado, null];

        }catch(error){
            console.log("error en obtenerUsuarioPorID", error);
            return[null, "error interno del servidor"];
        };
    };

//softdelete********
    const eliminarUsuarioService = async(id, ejecutor) =>{
        try{
            const usuario = AppDataSource.usuarioRepository.findOne({
                where: {id: parseInt(id_usuario)}
            });
            if(!usuario) throw new Error('usuario no encontrado');

            if (usuario.rol === 'ROOT') throw new Error('ROOT es intocable');

            if(ejecutor.rol === 'ADMIN' && usuario.creado_por !== ejecutor.id){
                throw new Error('solo puedes eliminar usuarios que tu mismo creaste');
            };

            usuario.activo = false;
            usuario.rol = SIN_ASIGNAR;
            usuario.fecha_actualizacion = new Date();

            await usuarioRepository.save(usuario);
            return [{message: 'usuario eliminado con exito'}, null];

        }catch(error){
            console.log("error en eliminarUsuarioService", error);
            return[null, "error interno del servidor"];
        };
    };





}


