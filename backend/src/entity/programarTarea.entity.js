import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class ProgramarTarea {

    @PrimaryGeneratedColumn()
    id_tarea;

    @Column()
    id_act;

    @Column()
    id_programador;

    @Column()
    fecha;

    @Column()
    hora;

    @Column({
        type: "enum",
        enum: [
            "PLANIFICADA",
            "EN_PROCESO",
            "FINALIZADA",
            "INCOMPLETA",
            "CANCELADA"
        ]
    })
    estado;

    @Column("text", { nullable: true })
    comentario;
}