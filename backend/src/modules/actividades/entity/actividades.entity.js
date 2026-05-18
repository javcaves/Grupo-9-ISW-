import { EntitySchema } from "typeorm";

export const Actividad = new EntitySchema({
    name: "Actividad",
    tableName:"actividad",
    columns:{
        id_act: {
            type: "int",
            primary: true,
            generated: true,
        },
        descripcion_esp: {
            type:"text",
            nullable:false,
        },
        recurrencia: {
            type:"enum",
            enum: ["DIARIA", "SEMANAL", "MENSUAL", "UNICA"],
            nullable: false,
        },
        activo: {
            type: "boolean",
            default: true,
        },
    },
    relations: {
        categoria: {
            target:"Categoria",
            type: "many-to-one",
            joinColumn: {name: "id_cat"},
        },
        proyecto: {
            target: "Proyecto",
            type:"many-to-one",
            joinColumn: {name: "id_proyecto"},
        },
    },
});