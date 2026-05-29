import {EntitySchema} from "typeorm";

const Power = new EntitySchema({
    name: "Power",
    tableNane: "power",

    columns:{
        id_power:{
           type: "varchar",
            length: 50,
            primary: true,
        },
        nombre:{
            type: "varchar",
            length: 100,
            nullable: false,
        },
        descripcion:{
            type:"text",
            nullable: false,
        },
        categoria:{
            type: "enum",
            enum: ["USUARIO", "PROYECTO", "BODEGA", "ACTIVIDAD", "ASISTENCIA"],
            nullable: false,
        },
        activo:{
            type: "boolean",
            nullable: false,
            default: true,
        }
    },

    indices:[
        {
            name: "IDX_POWER_CATEGORIA",
            columns: ["categoria"],
        }
    ]
});

export default Power;