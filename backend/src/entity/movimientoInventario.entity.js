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
        tipo: {
            type: "enum",
            enum: ["MAQUINARIA", "HERRAMIENTA", "UTENSILIO", "PRODUCTO"],
            nullable: true,
        },
        unidad_medida: {
            type: "enum",
            enum: ["LITROS", "UNIDADES", "KILOS", "SACOS", "BOLSAS", "METROS"],
            nullable: true,
        },
        control: {
            type: "enum",
            enum: ["CONSUMO", "PRESTAMO"],
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
            target: "Item", 
            type: "many-to-one",
            inverseSide: "movimientos",
            eager: true,
            nullable: true,
            joinColumn: { name: "id_item" },
        },
        proyecto: {
            target: "Proyecto",
            type: "many-to-one",
            onDelete: "CASCADE", 
            joinColumn: { name: "id_proyecto" },
        },
        emisor: {
            target: "Usuario",
            type: "many-to-one",
            onDelete: "RESTRICT", 
            joinColumn: { name: "id_emisor" },
        },
        receptor: {
            target: "Usuario",
            type: "many-to-one",
            nullable: true,
            onDelete: "SET NULL", 
            joinColumn: { name: "id_receptor" },
        },
    },
});