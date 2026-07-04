import { EntitySchema } from "typeorm";

/**
 * Tabla dedicada (no derivada) para poder marcar leido/no leido y llevar
 * historial. Se genera una fila POR DESTINATARIO cada vez que se crea un
 * MovimientoInventario con tipo_movimiento = 'SOLICITUD': todos los
 * SUPERVISOR/ADMIN/ROOT (los roles que pueden resolver via
 * PATCH /movimientos/:id_mov/resolver).
 *
 * id_movimiento referencia MovimientoInventario.id_mov. No se modela como
 * relation de TypeORM a proposito, para no acoplar este modulo nuevo a
 * como decidas registrar las entidades existentes (string vs. import de
 * clase) - se accede iaual por getRepository('Notificacion').
 */
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
        },
        id_movimiento: {
            type: "int",
            nullable: false,
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
