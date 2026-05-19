import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class Item {

    @PrimaryGeneratedColumn()
    id_item;

    @Column({ unique: true })
    nombre;

    @Column("text")
    descripcion;

    @Column({
        type: "enum",
        enum: [
            "MAQUINARIA",
            "HERRAMIENTA",
            "UTENCILIO",
            "PRODUCTO"
        ]
    })
    tipo;

    @Column({
        type: "enum",
        enum: [
            "LITROS",
            "UNIDADES",
            "KILOS",
            "SACOS",
            "BOLSAS",
            "METROS"
        ]
    })
    unidad_medida;

    @Column({
        type: "enum",
        enum: [
            "CONSUMO",
            "PRESTAMO"
        ]
    })
    control;

    @Column({ default: true })
    activo;
}