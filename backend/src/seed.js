// src/seed.js
import jwt from "jsonwebtoken";
import { AppDataSource, connectDB } from "./config/ConfigDB.js";
import { JWT_SECRET } from "./config/ConfigEnv.js";
import { poderesIniciales } from "./config/powers.data.js";

async function seed() {
    try {
        console.log("🔄 Iniciando carga dinámica de entidades y conexión a BD...");
        
        // 🌟 Reutilizamos tu lógica exacta de ConfigDB que lee la carpeta /entity e inicializa el DataSource
        await connectDB(); 

        // Ahora que sabemos con certeza que todos los modelos están montados en memoria:
        const usuarioRepository = AppDataSource.getRepository("Usuario");
        const powerRepository = AppDataSource.getRepository("Power");

        // ==========================================
        // 1. POBLAR EL CATÁLOGO MAESTRO DE PODERES
        // ==========================================
        console.log("\n⚡ Verificando catálogo de poderes...");
        
        // El upsert guardará o actualizará basándose en la clave primaria [id_power]
        await powerRepository.upsert(poderesIniciales, ["id_power"]);
        console.log(`✅ Catálogo de poderes sincronizado (${poderesIniciales.length} poderes listos).`);

        // ==========================================
        // 2. CREACIÓN / VERIFICACIÓN DEL USUARIO ROOT
        // ==========================================
        const rootRut = "11111111-1";
        let rootUser = await usuarioRepository.findOne({ where: { rut: rootRut } });

        if (!rootUser) {
            console.log("\n👤 Creando usuario ROOT inicial...");
            
            rootUser = usuarioRepository.create({
                rut: rootRut,
                nombre: "Zak",
                apellido: "Admin",
                observacion: "Usuario administrador inicial generado por el sistema",
                email: "admin@cleanadmin.com",
                rol: "ROOT",
                activo: true,
                numero: 912345678
            });

            rootUser = await usuarioRepository.save(rootUser);
            console.log("✅ Usuario ROOT guardado exitosamente con ID:", rootUser.id_usuario);
        } else {
            console.log("\nℹ️ El usuario ROOT ya existe en la base de datos.");
        }

        // ==========================================
        // 3. GENERACIÓN DEL TOKEN DE ACCESO JWT
        // ==========================================
        const userId = rootUser.id_usuario;
        
        // Se inyecta tanto 'id' como 'id_usuario' para dar compatibilidad total a tus middlewares
        const token = jwt.sign(
            { 
                id: userId, 
                id_usuario: userId, 
                rol: rootUser.rol 
            },
            JWT_SECRET,
            { expiresIn: "30d" }
        );

        console.log("\n=========================================================================================");
        console.log("🚀 ¡TODO LISTO! Usa este token en las cabeceras de Thunder Client para simular tus permisos:");
        console.log("=========================================================================================\n");
        console.log(`Bearer ${token}\n`);
        console.log("=========================================================================================");

    } catch (error) {
        console.error("\n❌ Error ejecutando el seed:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log("🔌 Conexión a la base de datos cerrada de forma limpia.");
        } else {
            console.log("🚫 No se cerró la conexión porque no logró establecerse.");
        }
    }
}

seed();