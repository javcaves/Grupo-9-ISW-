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
}
//busqueda**************
export const obtenerTodosActivos = async () => {
    try {
        const userRepo = AppDataSource.getRepository("Usuario");
        const usuarios = await userRepo.find({ 
            where: { activo: true }
        });
        return [usuarios, null];
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