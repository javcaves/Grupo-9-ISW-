import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class Turno {

    @PrimaryGeneratedColumn()
    id_turno;

    @Column()
    id_proyecto;

    @Column()
    hora_ingreso;

    @Column()
    hora_salida;

    @Column("text")
    descripcion;

    @Column({ default: true })
    activo;
}