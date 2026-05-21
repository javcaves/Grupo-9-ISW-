import { EntitySchema } from "typeorm";

export const Categoria = new EntitySchema({
    name: "Categoria",
    tableName: "categoria",
    columns: {
        id_cat: {
            type: "int",
            primary: true,
            generated: true,
        },
        nombre: {
            type: "varchar",
            length: 100,
            unique: true,
            nullable: false,
        },
        descripcion: {
            type: "text",
            nullable: true,
        },
        requiere_calificacion: {
            type: "boolean",
            default: false,
        },
        activo: {
            type: "boolean",
            default: true,
        },
    },
});