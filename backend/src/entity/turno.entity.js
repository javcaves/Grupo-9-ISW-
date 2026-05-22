// src/modules/turno/turno.entity.js (o donde tengas tu EntitySchema de Turno)
import { EntitySchema } from "typeorm";

export const Turno = new EntitySchema({
    name: "Turno",
    tableName: "turno",
    columns: {
        id_turno: {
            type: "int",
            primary: true,
            generated: true,
        },
        nombre: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        hora_ingreso: {
            type: "time",
            nullable: false,
        },
        hora_salida: {
            type: "time",
            nullable: false,
        },
        descripcion: {
            type: "text",
            nullable: true,
        },
        activo: {
            type: "boolean",
            default: true,
        },
    },
    relations: {
        proyecto: {
            target: "Proyecto",
            type: "many-to-one",
            joinColumn: { name: "id_proyecto" },
            nullable: false,
        },
        turnoEmpleados: {
            target: "TurnoEmpleado",
            type: "one-to-many",
            inverseSide: "turno"
        }
    },
});