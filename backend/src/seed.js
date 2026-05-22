// src/seed.js
import jwt from "jsonwebtoken";
import { AppDataSource } from "./config/ConfigDB.js";
import { JWT_SECRET } from "./config/ConfigEnv.js";

async function seed() {
    try {
        console.log("🔄 Conectando a la base de datos...");
        await AppDataSource.initialize();
        console.log("✅ Conexión establecida.");

        const usuarioRepository = AppDataSource.getRepository("Usuario");

        const rootRut = "11111111-1";
        
        let rootUser = await usuarioRepository.findOne({ where: { rut: rootRut } });

        if (!rootUser) {
            console.log("👤 Creando usuario ROOT inicial...");
            
            // Ajustado estrictamente a las columnas reales detectadas en tu tabla PostgreSQL
            rootUser = usuarioRepository.create({
                rut: rootRut,
                nombre: "Zak",
                apellido: "Admin",
                observacion: "Usuario administrador inicial generado por el sistema",
                email: "admin@cleanadmin.com", // <-- Cambiado de 'correo' a 'email'
                rol: "ROOT",
                activo: true,
                numero: 912345678
                // 'fecha_ingreso' se omitió aquí porque la BD le pone el DEFAULT (Date actual) automáticamente
            });

            rootUser = await usuarioRepository.save(rootUser);
            console.log("✅ Usuario ROOT guardado exitosamente con ID:", rootUser.id_usuario);
        } else {
            console.log("ℹ️ El usuario ROOT ya existe en la base de datos.");
        }

        // Generamos el Token usando el id_usuario que devolvió la inserción
        const userId = rootUser.id_usuario;
        
        const token = jwt.sign(
            { id: userId, rol: rootUser.rol, rol: rootUser.rol }, // Usamos rol como rol para asegurar compatibilidad
            JWT_SECRET,
            { expiresIn: "30d" }
        );

        console.log("\n=========================================================================================");
        console.log("🚀 ¡TODO LISTO! Usa este token en las cabeceras de Thunder Client para simular tus permisos:");
        console.log("=========================================================================================\n");
        console.log(`Bearer ${token}\n`);
        console.log("=========================================================================================");

    } catch (error) {
        console.error("❌ Error ejecutando el seed:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log("🔌 Conexión a la base de datos cerrada.");
        } else {
            console.log("🚫 No se cerró la conexión porque no logró establecerse.");
        }
    }
}

seed();