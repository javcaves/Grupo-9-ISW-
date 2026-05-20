// tabla intermedia de asignación con colaciones y feriados
import { EntitySchema } from 'typeorm';

export const TurnoEmpleado = new EntitySchema({
    name: "TurnoEmpleado",
    tableName: "turno_empleado",
    columns: {
        id_turno: {
            type: "int",
            primary: true,
        },
        id_empleado: {
            type: "int",
            primary: true,
        },
        fecha_ingreso: {
            type: "date",
            nullable: false,
        },
        fecha_egreso: {
            type: "date",
            nullable: true,
        },
        inicio_colacion: {
            type: "time",
            nullable: true,
        },
        fin_colacion: {
            type: "time",
            nullable: true,
        },
        trabaja_feriados: {
            type: "boolean",
            default: false,
        },
        activo: {
            type: "boolean",
            default: true,
        },
    },
    relations: {
        turno: {
            target: "Turno",
            type: "many-to-one",
            joinColumn: { name: "id_turno" },
            onDelete: "CASCADE",
        },
        empleado: {
            target: "Usuario",
            type: "many-to-one",
            joinColumn: { name: "id_empleado" },
            onDelete: "CASCADE",
        },
    },
});