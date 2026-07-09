import { EntitySchema } from "typeorm";

export const Notificacion = new EntitySchema({
    name: "Notificacion",
    tableName: "notificacion",

    columns: {
        id_notificacion: {
            type: "int",
            primary: true,
            generated: true,
        },
        id_usuario_destinatario: {
            type: "int",
            nullable: false,
        },
        tipo: {
            type: "varchar",
            length: 50,
            nullable: false,
            // "SOLICITUD_PENDIENTE" | "SOLICITUD_APROBADA" | "SOLICITUD_RECHAZADA"
            // | "SOLICITUD_PASSWORD" | (futuros: "CORRECCION_ASISTENCIA", etc.)
        },
        tipo_referencia: {
            type: "varchar",
            length: 50,
            nullable: true,
            // "MOVIMIENTO_INVENTARIO" | "USUARIO" | null
        },
        id_referencia: {
            type: "int",
            nullable: true,
        },
        mensaje: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        leido: {
            type: "boolean",
            nullable: false,
            default: false,
        },
        fecha: {
            type: "timestamp",
            nullable: false,
            default: () => "CURRENT_TIMESTAMP",
        },
    },

    indices: [
        {
            name: "IDX_NOTIFICACION_DESTINATARIO",
            columns: ["id_usuario_destinatario"],
        },
        {
            name: "IDX_NOTIFICACION_LEIDO",
            columns: ["leido"],
        },
    ],
});

export default Notificacion;
