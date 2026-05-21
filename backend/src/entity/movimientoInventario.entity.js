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
            createDate: true, 
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
            target: "Item", 
            inverseSide: "movimientos",
            eager: true,
            nullable: true,
            joinColumn: {
                name: "id_item",
            },
        },
        proyecto: {
            type: "many-to-one",
            target: "Proyecto",
            onDelete: "CASCADE", // Si cae el proyecto, se limpia su historial de movimientos
            joinColumn: {
                name: "id_proyecto",
            },
        },
        emisor: {
            type: "many-to-one",
            target: "Usuario",
            onDelete: "RESTRICT", // No permite eliminar al usuario si tiene movimientos firmados
            joinColumn: {
                name: "id_emisor",
            },
        },
        receptor: {
            type: "many-to-one",
            target: "Usuario",
            nullable: true,
            onDelete: "SET NULL", // Preserva el registro del movimiento aunque el receptor ya no exista
            joinColumn: {
                name: "id_receptor",
            },
        },
    },
});
