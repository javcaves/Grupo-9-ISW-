import {EntitySchema} from "typeorm";
import Usuario from "./usuario.entity.js";

const Proyecto = new EntitySchema({
    name: "Proyecto",
    tableName: "proyecto",
    
    columns:{
        id_proyecto:{
            type: "int",
            primary: true,
            generated: true,
        },
        nombre_proy:{
            type: "varchar",
            length: 100,
            nullable: false,
        },
        min_emp:{
            type: "int",
            nullable: false,
        },
        max_emp:{
            type: "int",
            nullable: false,
        },
        ubicacion:{
            type:"text",
            nullable:false,
        },
        fecha_inicio:{
            type: "timestamp",
            nullable: false,
            default: () => "CURRENT_TIMESTAMP",
        },
        fecha_termino:{
            type: "timestamp",
            nullable: true,
        },
        //nullable si sigue activo

        estado:{
            type: "enum",
            enum: ["EN_PREPARACION", "EN_CURSO", "FINALIZADO"],
            nullable: false,
            default: "EN_PREPARACION",
        },
        activo:{
            type: "boolean",
            nullable: false,
            default: true,
        }
    },

   //para busquedas por si acaso
    indices:[
        {
            name: "IDX_PROYECTO_ESTADO",
            columns: ["estado"],
        },
        {
            name: "IDX_PROYECTO_ACTIVO",
            columns: ["activo"],
        }

    ]
});

export default Proyecto;