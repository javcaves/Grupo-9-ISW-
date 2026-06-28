import { EntitySchema } from "typeorm";

export const AsignacionTarea =new EntitySchema({
    name: "AsignacionTarea",
    tableName: "asignacion_tarea",
    columns: {
        id_asignacion: {
            type: "int",
            primary: true,
            generated: true,
        },
        tipo_asignacion: {
            type: "enum",
            enum: ["PROGRAMADA", "REASIGNADA"],
            default: "PROGRAMADA",
        },
        hora_asignacion: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    relations: {
        tarea: {
            target: "ProgramarTarea",
            type: "many-to-one",
            joinColumn: { name: "id_tarea" },
            inverseSide: "asignaciones",
        },
        empleado: {
            target: "Usuario",
            type: "many-to-one",
            joinColumn: { name: "id_empleado" },
        },
        asignador: {
            target: "Usuario",
        type: "many-to-one",
        joinColumn: { name: "id_asignador" },
        },
    },
});