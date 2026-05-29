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
            target: "Item",
            type: "many-to-one",
            inverseSide: "proyectos",
            eager: true,
            onDelete: "CASCADE",
            joinColumn: {name: "id_item"},
        },
        proyecto: {
            target: "Proyecto",
            type: "many-to-one",
            onDelete: "CASCADE",
            joinColumn: {name: "id_proyecto"},
        },
    },
});