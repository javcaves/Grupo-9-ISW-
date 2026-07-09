import { EntitySchema } from "typeorm";

export const SolicitudAsistencia = new EntitySchema({
    name: "SolicitudAsistencia",
    tableName: "solicitud_asistencia",

    columns: {
        id_solicitud: { type: "int", primary: true, generated: true },
        id_asistencia: { type: "int", nullable: false },
        id_empleado: { type: "int", nullable: false },
        estado_solicitado: {
            type: "enum",
            enum: ["PRESENTE", "ATRASO", "FALTA_INJUSTIFICADA", "FALTA_JUSTIFICADA", "EN_ESPERA", "RETIRADO"],
            nullable: true,
        },
        hora_ingreso_solicitada: { type: "varchar", length: 8, nullable: true },
        hora_egreso_solicitada: { type: "varchar", length: 8, nullable: true },
        motivo: { type: "varchar", length: 500, nullable: false },
        estado_solicitud: {
            type: "enum",
            enum: ["PENDIENTE", "APROBADO", "RECHAZADO"],
            nullable: false,
            default: "PENDIENTE",
        },
        fecha_solicitud: { type: "timestamp", default: () => "CURRENT_TIMESTAMP" },
        fecha_resolucion: { type: "timestamp", nullable: true },
        resuelto_por: { type: "int", nullable: true },
    },

    relations: {
        asistencia: {
            target: "Asistencia",
            type: "many-to-one",
            joinColumn: { name: "id_asistencia" },
        },
        empleado: {
            target: "Usuario",
            type: "many-to-one",
            joinColumn: { name: "id_empleado" },
        },
    },
});

export default SolicitudAsistencia;