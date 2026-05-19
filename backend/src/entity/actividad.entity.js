import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class Actividad {

    @PrimaryGeneratedColumn()
    id_act;

    @Column()
    id_cat;

    @Column()
    id_proyecto;

    @Column("text")
    descripcion_esp;

    @Column({
        type: "enum",
        enum: [
            "DIARIA",
            "SEMANAL",
            "MENSUAL",
            "UNICA"
        ]
    })
    recurrencia;

    @Column({ default: true })
    activo;
}