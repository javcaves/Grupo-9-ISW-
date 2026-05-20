import {EntitySchema} from "typeorm";
import Usuario from "./usuario.entity";
import Power from "./power.entity";

const PowerUsuario = new EntitySchema({
    name: "PowerUsuario",
    tableName: "power_usuario",

    columns:{
        id_asignacion:{
            type: "int",
            primary: true,
            generated: true,
        },
        id_usuario:{
            type: "int",
            primary: true,
            generated: true,
        },
        id_power:{
           type: "varchar",
            length: 50,
            primary: true,
        },
        otorgado_por_id:{
            type: "int",
            nullable: false,
        },
        fecha_asignacion:{
            type: "timestamp",
            nullable: false,
            default: () => "CURRENT_TIMESTAMP",
        },
        activo:{
            type: "boolean",
            nullable: false,
            default: true,
        }
    },

    indices:[
        {
            name: "IDX_POWER_USUARIO_USER",
            columns: ["id_usuario"], 
        },
        {
            name: "IDX_USUARIO_POWER_POWER",
            columns: ["id_power"],
        }
    ],

    //como es relacion mucho a muchos
    relations:{
        usuario:{
            type: "many-to-one",
            target: "Usuario",
            joinColumn: {name: "id_usuario"},
        },
        power:{
            type: "many-to-one",
            target: "Power",
            joinColumn: {name: "id_power"},
        },
        otorgadoPor:{
            type: "many-to-one",
            target: "Usuario",
            joinColumn: {name: "otorgado_por_id"},
        }
    }
});

export default PowerUsuario;