import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class CalificacionEmpleado {

    @PrimaryGeneratedColumn()
    id_calificacion;

    @Column()
    id_cat;

    @Column()
    id_empleado;

    @Column()
    id_otorga;

    @Column()
    fecha_otorgamiento;

    @Column({ default: true })
    activo;
}