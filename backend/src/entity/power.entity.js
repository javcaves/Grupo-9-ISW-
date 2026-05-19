import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class Power {

    @PrimaryGeneratedColumn()
    id_power;

    @Column({ unique: true })
    nombre_power;

    @Column("text")
    descripcion;

    @Column({ default: true })
    activo;
}