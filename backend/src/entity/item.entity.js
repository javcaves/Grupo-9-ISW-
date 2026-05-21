import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";
import { MovimientoInventario } from "./movimientoInventario.entity.js";
import { ItemProyecto } from "./item_proyecto.entity.js"; 

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

    @Column({ default: true })
    activo;

    @OneToMany(() => MovimientoInventario, (mov) => mov.item)
    movimientos;

    @OneToMany(() => ItemProyecto, (ip) => ip.item)
    proyectos;
}
