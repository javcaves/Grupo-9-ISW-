import { EntitySchema } from "typeorm";

export const EvaluacionDesempeno = new EntitySchema({
    name: "EvaluacionDesempeno",
    tableName: "evaluacion_desempeno",
    columns: {
        id_evaluacion: {
            type: "int",
            primary: true,
            generated: true,
        },
        calificacion: {
            type: "int",
            comment: "Escala 1-5. Mide la calidad del trabajo realizado.",
        },
        cumplio: {
            type: "boolean",
            comment: "Indica si el empleado cumplió con la tarea, independiente de la calidad.",
        },
        comentario: {
            type: "varchar",
            length: 500,
            nullable: true,
        },
        fecha_evaluacion: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
        activo: {
            type: "boolean",
            default: true,
        },
    },
    relations: {
        tarea: {
            target: "ProgramarTarea",
            type: "many-to-one",
            joinColumn: { name: "id_tarea" },
        },
        empleado: {
            target: "Usuario",
            type: "many-to-one",
            joinColumn: { name: "id_empleado" },
        },
        evaluador: {
            target: "Usuario",
            type: "many-to-one",
            joinColumn: { name: "id_evaluador" },
        },
    },
});
