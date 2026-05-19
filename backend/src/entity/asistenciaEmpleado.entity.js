import {
    Entity,
    PrimaryColumn,
    Column
} from "typeorm";

@Entity()
export class AsistenciaEmpleado {

    @PrimaryColumn()
    id_asistencia;

    @PrimaryColumn()
    id_empleado;

    @Column({ nullable: true })
    hora_ingreso;

    @Column({ nullable: true })
    hora_egreso;

    @Column({
        type: "enum",
        enum: [
            "EN_ESPERA",
            "PRESENTE",
            "RETIRADO",
            "ATRASO",
            "FALTA_JUSTIFICADA",
            "FALTA_INJUSTIFICADA"
        ],
        default: "EN_ESPERA"
    })
    estado;

    @Column("text", { nullable: true })
    descripcion;

    @Column({ nullable: true })
    editado_por;

    @Column({ nullable: true })
    fecha_edicion;

    @Column({ default: false })
    geo_verificada;

    @Column({ default: true })
    activo;
}