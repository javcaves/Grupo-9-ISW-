import {
    Entity,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
    Column
} from "typeorm";

import { Proyecto } from "./Proyecto.entity.js";
import { Usuario } from "./Usuario.entity.js";

@Entity()
export class ProyectoUsuario {

    @PrimaryColumn()
    id_proyecto;

    @PrimaryColumn()
    id_usuario;

    @ManyToOne(() => Proyecto)
    @JoinColumn({ name: "id_proyecto" })
    proyecto;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: "id_usuario" })
    usuario;

    @Column()
    fecha_asignacion;

    @Column()
    fecha_termino;

    @Column({ default: true })
    activo;
}