import { Entity,
        Column,
        ManyToOne,
        JoinColumn, 
        PrimaryColumn 
} from "typeorm";
import { Item } from "./item.entity.js";

@Entity()
export class ItemProyecto {
    @PrimaryColumn()
    id_item;

    @PrimaryColumn()
    id_proyecto;

    @ManyToOne(() => Item, (item) => item.proyectos, { eager: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "id_item" })
    item;

    @Column({ type: "int", default: 0 })
    cantidad; // Equivalente al stock_actual de proyecto

    @Column({ type: "int", default: 0 })
    stock_minimo;

    @Column({ type: "date", nullable: true })
    ultima_revision;

    @Column({ default: true })
    activo;
}
