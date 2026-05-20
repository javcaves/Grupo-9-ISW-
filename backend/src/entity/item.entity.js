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
            "UTENSILIO",
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

    @Column({ type: "int", default: 0 })
    stock_actual;

    @Column({ type: "int", default: 0 })
    stock_minimo;

    @Column({ default: true })
    activo;
}
