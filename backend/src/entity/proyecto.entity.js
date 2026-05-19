import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class Proyecto {

    @PrimaryGeneratedColumn()
    id_proyecto;

    @Column()
    nombre_proy;

    @Column()
    min_emp;

    @Column()
    max_emp;

    @Column()
    ubicacion;

    @Column()
    fecha_inicio;

    @Column()
    fecha_termino;

    @Column({
        type: "enum",
        enum: [
            "EN_PREPARACION",
            "EN_CURSO",
            "FINALIZADO"
        ]
    })
    estado;

    @Column({ default: true })
    activo;
}