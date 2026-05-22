import { EntitySchema } from "typeorm";

const PowerUsuario = new EntitySchema({
    name: "PowerUsuario",
    tableName: "power_usuario",

    columns: {
        id_asignacion: {
            type: "int",
            primary: true,
            generated: true,
        },
        id_usuario: {
            type: "int",
            nullable: false,
        },
        id_power: {
            type: "varchar",
            length: 50,
            nullable: false,
        },
        otorgado_por_id: {
            type: "int",
            nullable: false,
        },
        fecha_asignacion: {
            type: "timestamp",
            nullable: false,
            default: () => "CURRENT_TIMESTAMP",
        },
        activo: {
            type: "boolean",
            nullable: false,
            default: true,
        }
    },

    indices: [
        {
            name: "IDX_POWER_USUARIO_USER",
            columns: ["id_usuario"], 
        },
        {
            name: "IDX_USUARIO_POWER_POWER",
            columns: ["id_power"],
        }
    ],

    relations: {
        usuario: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: { name: "id_usuario" },
        },
        power: {
            type: "many-to-one",
            target: "Power",
            joinColumn: { name: "id_power" },
        },
        otorgadoPor: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: { name: "otorgado_por_id" },
        }
    }
});

export default PowerUsuario;