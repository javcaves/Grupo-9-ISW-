import {
    Entity,
    PrimaryColumn,
    Column
} from "typeorm";

@Entity()
export class TurnoEmpleado {

    @PrimaryColumn()
    id_turno;

    @PrimaryColumn()
    id_empleado;

    @Column()
    fecha_ingreso;

    @Column({ nullable: true })
    fecha_egreso;

    @Column({ nullable: true })
    inicio_colacion;

    @Column({ nullable: true })
    fin_colacion;

    @Column({ default: false })
    trabaja_feriados;

    @Column({ default: true })
    activo;
}