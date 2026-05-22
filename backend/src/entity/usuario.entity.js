import {EntitySchema} from "typeorm";

const Usuario = new EntitySchema({
    name: "Usuario",
    tableName: "usuario",
    columns:{
        id_usuario:{
            type: "int",
            primary: true,
            generated: true,
        },
        rut:{
            type: "varchar",
            length: 15,
            nullable: false,
            unique: true,
        },
        nombre:{
            type: "varchar",
            length: 100,
            nullable: false,
        },
        apellido:{
            type: "varchar",
            length: 100,
            nullable: false,
        },
        observacion:{
            type:"text",
            nullable:false,
        },
        email:{
            type: "varchar",
            length: 100,
            nullable: false,
        },
        numero:{
            type: "varchar",
            length: 15,
            nullable: false,
            unique: true,

        },
        rol:{
            type: "varchar",
            length: 100,
            nullable: false,
        },
        fecha_ingreso:{
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
            name: "IDX_USUARIO_RUT",
            columns: ["rut"],
            unique: true,
        },
    ],


});

export default Usuario;