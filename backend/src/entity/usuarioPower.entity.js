import {
    Entity,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
    Column
} from "typeorm";

import { Usuario } from "./Usuario.entity.js";
import { Power } from "./Power.entity.js";

@Entity()
export class UsuarioPower {

    @PrimaryColumn()
    id_usuario;

    @PrimaryColumn()
    id_power;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: "id_usuario" })
    usuario;

    @ManyToOne(() => Power)
    @JoinColumn({ name: "id_power" })
    power;

    @Column()
    otorgado_por_id;

    @Column()
    fecha;

    @Column({ default: true })
    activo;
}