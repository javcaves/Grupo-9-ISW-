// entity/notificacion.entity.js
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
            // | "SOLICITUD_PASSWORD" | "SOLICITUD_ASISTENCIA"
        },
        tipo_referencia: {
            type: "varchar",
            length: 50,
            nullable: true,
            // "MOVIMIENTO_INVENTARIO" | "USUARIO" | "SOLICITUD_ASISTENCIA" | null
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
        // NUEVO: fuente única de verdad de "¿esto todavía requiere acción?".
        // "leido" solo significa "el usuario ya lo vio"; "resuelto" significa
        // "ya se actuó sobre esto" (se aprobó/rechazó el item, se reseteó la
        // password, se resolvió la corrección de asistencia). La campana
        // filtra resuelto=false; el historial no filtra por esto (o permite
        // elegir).
        resuelto: {
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
        {
            name: "IDX_NOTIFICACION_RESUELTO",
            columns: ["resuelto"],
        },
    ],
});

export default Notificacion;