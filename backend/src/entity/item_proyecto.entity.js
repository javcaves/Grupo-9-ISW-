import { EntitySchema } from "typeorm";

export const ItemProyecto = new EntitySchema({
    name: "ItemProyecto",
    tableName: "item_proyecto",
    columns: {
        id_item: {
            type: "int",
            primary: true,
        },
        id_proyecto: {
            type: "int",
            primary: true,
        },
        cantidad: {
            type: "int",
            default: 0,
        },
        stock_minimo: {
            type: "int",
            default: 0,
        },
        ultima_revision: {
            type: "timestamp",
            nullable: true,
        },
        activo: {
            type: "boolean",
            default: true,
        },
    },
    relations: {
        item: {
            type: "many-to-one",
            target: "Item", // Mapea con el name del esquema Item
            inverseSide: "proyectos",
            eager: true,
            onDelete: "CASCADE",
            joinColumn: {
                name: "id_item",
            },
        },

        proyecto: {
            type: "many-to-one",
            target: "Proyecto", 
            onDelete: "CASCADE",
            joinColumn: {
                name: "id_proyecto",
            },
        },

        
    },
});
