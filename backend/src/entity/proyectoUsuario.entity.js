import {EntitySchema} from "typeorm";
import Usuario from "./usuario.entity.js";
import Proyecto from "./proyecto.entity.js";

const ProyectoUsuario = new EntitySchema({
    name: "ProyectoUsuario",
    tableName: "proyecto_usuario",

    columns:{
        id_proyecto: {
            type: "int",
            primary: true,
        },
        id_usuario: {
            type: "int",
            primary: true,
        },
        fecha_asignacion:{
            type: "timestamp",
            nullable: false,
            default: () => "CURRENT_TIMESTAMP",
        },
        fecha_termino:{
            type: "timestamp",
            nullable: true,
        }
    },

    indices:[
        {
            name: "IDX_PROYECTO_USUARIO",
            columns: ["id_proyecto", "id_usuario"],
            unique: true,
        }
    ],

     //como es relacion de mucho a muchos
    relations:{
        proyecto:{
            type: "many-to-one",
            target: "Proyecto",
            joinColumn: {name: "id_proyecto"},
        },
        usuario:{
            type: "many-to-one",
            target: "Usuario",
            joinColumn: {name: "id_usuario"},
        },
    },
});

export default ProyectoUsuario;