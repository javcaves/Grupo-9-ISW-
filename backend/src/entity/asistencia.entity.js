import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class Asistencia {

    @PrimaryGeneratedColumn()
    id_asistencia;

    @Column()
    id_encargado;

    @Column()
    id_proyecto;

    @Column()
    id_turno;

    @Column()
    fecha;

    @Column({ unique: true })
    token;

    @Column()
    token_expira;

    @Column({ default: true })
    activo;
}