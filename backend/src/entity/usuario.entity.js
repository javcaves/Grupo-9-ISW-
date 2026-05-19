import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

@Entity()
export class Usuario {

    @PrimaryGeneratedColumn()
    id_usuario;

    @Column()
    nombre;

    @Column()
    apellido;

    @Column({ unique: true })
    rut;

    @Column({ unique: true })
    email;

    @Column({ unique: true })
    username;

    @Column()
    password;

    @Column({
        type: "enum",
        enum: [
            "ROOT",
            "ADMIN",
            "SUPERVISOR",
            "ENCARGADO",
            "EMPLEADO",
            "SIN_ASIGNAR"
        ],
        default: "SIN_ASIGNAR"
    })
    rol;

    @Column({ default: true })
    activo;
}