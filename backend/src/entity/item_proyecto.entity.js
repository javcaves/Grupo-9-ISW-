import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    PrimaryColumn
} from "typeorm";
import { Item } from "./item.entity.js";

// Entidad intermedia para gestionar el stock distribuido por proyecto
// Facilita el control detallado de insumos 
@Entity()
export class ItemProyecto {
    @PrimaryColumn()
    id_item;

    @PrimaryColumn()
    id_proyecto;

    // Relación con la tabla principal de Items
    // eager: true permite que al consultar el stock, traiga automáticamente los detalles del item (nombre, unidad_medida, etc.)
    @ManyToOne(() => Item, (item) => item.proyectos, { eager: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "id_item" })
    item;

    // Cantidad actual del insumo 
    @Column({ type: "int", default: 0 })
    cantidad; 

    // Alerta de stock 
    @Column({ type: "int", default: 0 })
    stock_minimo;

    // Fecha en la que un supervisor o encargado realizó la última revision
    @Column({ type: "timestamp", nullable: true })
    ultima_revision;

    // Soft delete a nivel de proyecto por si un insumo deja de utilizarse
    @Column({ default: true })
    activo;
}
