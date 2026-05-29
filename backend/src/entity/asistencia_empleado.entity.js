import { EntitySchema } from "typeorm";

export const AsistenciaEmpleado = new EntitySchema({
    name: "AsistenciaEmpleado",
    tableName: "asistencia_empleado",
    columns: {
        // Clave primaria compuesta
        id_asistencia: {
            type: "int",
            primary: true,
        },
        id_empleado: {
            type: "int",
            primary: true,
        },
        hora_ingreso: {
            type: "time",
            nullable: true,
        },
        hora_egreso: {
            type: "time",
            nullable: true,
        },
        estado: {
            type: "enum",
            enum: ["EN_ESPERA", "PRESENTE", "RETIRADO", "ATRASO", "FALTA_JUSTIFICADA", "FALTA_INJUSTIFICADA"],
            default: "EN_ESPERA",
        },
        descripcion: {
            type: "text",
            nullable: true,
        },
        editado_por: {
            type: "int",
            nullable: true,
        },
        fecha_edicion: {
            type: "timestamp",
            nullable: true,
        },
        geo_verificada: {
            type: "boolean",
            default: false,
        },
        activo: {
            type: "boolean",
            default: true,
        },
    },
    relations: {
        asistencia: {
            target: "Asistencia",
            type: "many-to-one",
            joinColumn: { name: "id_asistencia" },
            onDelete: "CASCADE",
        },
        empleado: {
            target: "Usuario",
            type: "many-to-one",
            joinColumn: { name: "id_empleado" },
        },
    },
});