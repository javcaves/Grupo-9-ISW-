import { EntitySchema } from "typeorm";

export const ProgramarTarea = new EntitySchema({
    name: "ProgramarTarea",
    tableName: "programar_tarea",
    columns: {
        id_tarea: {
            type: "int",
            primary: true,
            generated: true,
        },
        fecha: {
            type: "date",
            nullable: false,
        },
        hora: {
            type: "time",
            nullable: false,
        },
        estado: {
            type: "enum",
            enum: ["PLANIFICADA", "EN_PROCESO", "FINALIZADA", "INCOMPLETA", "CANCELADA"],
            default: "PLANIFICADA",
        },
        comentario: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
    },
    relations: {
        actividad: {
            target: "Actividad",
            type: "many-to-one",
            joinColumn: {name: "id_act"},
        },
        programador: {
            target: "Usuario",
            type: "many-to-one",
            joinColumn: {name: "id_programador"},
        },
        asignaciones: {
            target: "AsignacionTarea",
            type: "one-to-many",
            inverseSide: "tarea",
        },
    },
});