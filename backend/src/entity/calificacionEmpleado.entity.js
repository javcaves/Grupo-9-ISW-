import { EntitySchema } from "typeorm";

export const CalificacionEmpleado = new EntitySchema({
    name: "CalificacionEmpleado",
    tableName: "calificacion_empleado",
    columns: {
        id_calificacion: {
            type: "int",
            primary: true,
            generated: true,
        },
        fecha_otorgamiento: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
        activo: {
            type: "boolean",
            default: true,
        },
    },
    relations: {
        categoria: {
            target: "Categoria",
            type: "many-to-one",
            joinColumn: {name: "id_cat"},
        },
        empleado: {
            target: "Usuario",
            type: "many-to-one",
            joinColumn: { name: "id_empleado"},
        },
        otorga: {
            target: "Usuario",
            type: "many-to-one",
            joinColumn: { name: "id_otorga"},
        },
    },
});