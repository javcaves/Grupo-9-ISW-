import { EntitySchema } from "typeorm";

export const Asistencia = new EntitySchema({
    name: "Asistencia",
    tableName: "asistencia",
    columns: {
        id_asistencia: {
            type: "int",
            primary: true,
            generated: true,
        },
        fecha: {
            type: "date",
            nullable: false,
        },
        token: {
            type: "varchar",
            length: 64,
            unique: true,
            nullable: false,
        },
        token_expira: {
            type: "timestamp",
            nullable: false,
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
            nullable: false,
        },
        encargado: {
            target: "Usuario",
            type: "many-to-one",
            joinColumn: { name: "id_encargado" },
            nullable: false,
        },
        proyecto: {
            target: "Proyecto",
            type: "many-to-one",
            joinColumn: { name: "id_proyecto" },
            nullable: false,
        },
    },
});