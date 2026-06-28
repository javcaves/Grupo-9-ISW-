// src/seed.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppDataSource, connectDB } from "../config/ConfigDB.js";
import { JWT_SECRET } from "../config/ConfigEnv.js";
import { loadSeed } from "./seedLoader.js";

async function seed() {
    try {
        console.log("🔄 Iniciando carga dinámica de entidades y conexión a BD...");
        await connectDB();

        const usuarioRepository = AppDataSource.getRepository("Usuario");

        // ══════════════════════════════════════════════════════════════════════
        // 1. CATÁLOGO MAESTRO DE PODERES
        // ══════════════════════════════════════════════════════════════════════
        console.log("\n⚡ Verificando catálogo de poderes...");

        // ══════════════════════════════════════════════════════════════════════
        // 2. USUARIO ROOT
        // ══════════════════════════════════════════════════════════════════════
        const rootRut = "11111111-1";
        let rootUser  = await usuarioRepository.findOne({ where: { rut: rootRut } });

        if (!rootUser) {
            console.log("\n👤 Creando usuario ROOT inicial...");
            const hashedAdminPassword = await bcrypt.hash("admin123", 10);

            rootUser = usuarioRepository.create({
                rut:         rootRut,
                nombre:      "Zak",
                apellido:    "Admin",
                password:    hashedAdminPassword,
                observacion: "Usuario administrador inicial generado por el sistema",
                email:       "admin@cleanadmin.com",
                rol:         "ROOT",
                activo:      true,
                numero:      "+56912345678",
            });

            rootUser = await usuarioRepository.save(rootUser);
            console.log("✅ Usuario ROOT guardado con ID:", rootUser.id_usuario);
        } else {
            console.log("\nℹ️  El usuario ROOT ya existe en la base de datos.");
        }

        // ══════════════════════════════════════════════════════════════════════
        // 3. DATOS DE PRUEBA (minimal_seed.json)
        // ══════════════════════════════════════════════════════════════════════
        console.log("\n📦 Cargando datos de prueba desde minimal_seed.json...");
        const resumen = await loadSeed();

        // Mostrar resumen final del seed
        const ok     = resumen.filter(r => r.status === "ok");
        const errors = resumen.filter(r => r.status === "error");

        console.log(`\n📊 Resumen de seed: ${ok.length} entidades OK, ${errors.length} con error.`);
        if (errors.length > 0) {
            console.warn("⚠️  Entidades con error:");
            errors.forEach(r => console.warn(`   - ${r.entity}: ${r.error}`));
        }

        // ══════════════════════════════════════════════════════════════════════
        // 4. TOKEN JWT PARA DESARROLLO
        // ══════════════════════════════════════════════════════════════════════
        const token = jwt.sign(
            { id: rootUser.id_usuario, id_usuario: rootUser.id_usuario, rol: rootUser.rol },
            JWT_SECRET,
            { expiresIn: "30d" }
        );

        console.log("\n=================================================================================");
        console.log("🚀 ¡TODO LISTO! Token para Thunder Client / Postman:");
        console.log("=================================================================================\n");
        console.log(`Bearer ${token}\n`);
        console.log("=================================================================================");

    } catch (error) {
        console.error("\n❌ Error ejecutando el seed:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log("\n🔌 Conexión cerrada de forma limpia.");
        } else {
            console.log("\n🚫 La conexión no llegó a establecerse.");
        }
    }
}

seed();