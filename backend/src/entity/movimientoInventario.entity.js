import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class MovimientoInventario {

    @PrimaryGeneratedColumn()
    id_mov;

    @Column()
    id_item;

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

    @Column()
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
