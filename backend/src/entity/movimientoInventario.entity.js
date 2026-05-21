import { EntitySchema } from "typeorm";

export const MovimientoInventario = new EntitySchema({
    name: "MovimientoInventario",
    tableName: "movimiento_inventario",
    columns: {
        id_mov: {
            type: "int",
            primary: true,
            generated: true,
        },
        item_sugerido: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        id_proyecto: {
            type: "int",
            nullable: false,
        },
        id_emisor: {
            type: "int",
            nullable: false,
        },
        id_receptor: {
            type: "int",
            nullable: true,
        },
        tipo_movimiento: {
            type: "enum",
            enum: ["ENTRADA", "SALIDA", "SOLICITUD", "ABASTECIMIENTO", "COMPRA"],
            nullable: false,
        },
        cantidad: {
            type: "int",
            nullable: false,
        },
        fecha: {
            type: "timestamp",
            createDate: true, // Reemplaza a @CreateDateColumn()
        },
        descripcion: {
            type: "text",
            nullable: true,
        },
        estado_solicitud: {
            type: "enum",
            enum: ["PENDIENTE", "APROBADO", "RECHAZADO"],
            nullable: true,
        },
    },
    relations: {
        item: {
            type: "many-to-one",
            target: "Item", // Coincide con el 'name' del esquema Item
            inverseSide: "movimientos",
            eager: true,
            nullable: true,
            joinColumn: {
                name: "id_item",
            },
        },
    },
});