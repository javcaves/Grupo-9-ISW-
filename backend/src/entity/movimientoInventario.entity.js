import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn
} from "typeorm";
import { Item } from "./item.entity.js";

@Entity()
export class MovimientoInventario {

    @PrimaryGeneratedColumn()
    id_mov;

    @ManyToOne(() => Item, (item) => item.movimientos, { eager: true })
    @JoinColumn({ name: "id_item" })
    item;

    @Column()
    id_proyecto;

    @Column()
    id_emisor;

    @Column({ nullable: true })
    id_receptor;

    @Column({
        type: "enum",
        enum: [
            "ENTRADA",
            "SALIDA",
            "SOLICITUD",
            "ABASTECIMIENTO",
            "COMPRA"
        ]
    })
    tipo_movimiento;

    @Column()
    cantidad;

    @CreateDateColumn()
    fecha;

    @Column("text")
    descripcion;

    @Column({
        type: "enum",
        enum: [
            "PENDIENTE",
            "APROBADO",
            "RECHAZADO"
        ],
        nullable: true
    })
    estado_solicitud;
}

