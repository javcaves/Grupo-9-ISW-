import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class AsignacionTarea {

    @PrimaryGeneratedColumn()
    id_asignacion;

    @Column()
    id_tarea;

    @Column()
    id_empleado;

    @Column()
    id_asignador;

    @Column({
        type: "enum",
        enum: [
            "PROGRAMADA",
            "REASIGNADA"
        ]
    })
    tipo_asignacion;

    @Column()
    hora_asignacion;
}