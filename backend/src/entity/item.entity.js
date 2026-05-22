import { EntitySchema } from "typeorm";

export const Item = new EntitySchema({
    name: "Item",
    tableName: "item",
    columns: {
        id_item: {
            type: "int",
            primary: true,
            generated: true,
        },
        nombre: {
            type: "varchar",
            length: 255, // Agregado longitud estándar para evitar fallos en BD
            unique: true,
            nullable: false,
        },
        descripcion: {
            type: "text",
            nullable: true,
        },
        tipo: {
            type: "enum",
            enum: ["MAQUINARIA", "HERRAMIENTA", "UTENSILIO", "PRODUCTO"],
            nullable: false,
        },
        unidad_medida: {
            type: "enum",
            enum: ["LITROS", "UNIDADES", "KILOS", "SACOS", "BOLSAS", "METROS"],
            nullable: false,
        },
        control: {
            type: "enum",
            enum: ["CONSUMO", "PRESTAMO"],
            nullable: false,
        },
        activo: {
            type: "boolean",
            default: true,
        },
    },
    relations: {
        movimientos: {
            type: "one-to-many",
            target: "MovimientoInventario", // El string mapea con el 'name' del otro esquema
            inverseSide: "item",
        },
        proyectos: {
            type: "one-to-many",
            target: "ItemProyecto", // El string mapea con el 'name' del otro esquema
            inverseSide: "item",
        },
    },
});