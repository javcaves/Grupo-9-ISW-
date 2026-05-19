import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class Categoria {

    @PrimaryGeneratedColumn()
    id_cat;

    @Column({ unique: true })
    nombre;

    @Column("text")
    descripcion;

    @Column({ default: false })
    requiere_calificacion;

    @Column({ default: true })
    activo;
}