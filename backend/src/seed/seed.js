// src/seed.js
import jwt from "jsonwebtoken";
import { AppDataSource, connectDB } from "../config/ConfigDB.js";
import { JWT_SECRET } from "../config/ConfigEnv.js";
import { ensureRootUser } from "./ensureRoot.js";
import { resetSeedTables, loadSeedSql } from "./seedLoader.js";

async function seed() {
    try {
        console.log("🔄 Iniciando carga dinámica de entidades y conexión a BD...");
        await connectDB();

        // ══════════════════════════════════════════════════════════════════════
        // 1. RESET DE TABLAS DE SEED
        //    ⚠️ Destructivo: vacía usuario, proyecto, turno, asistencia, item,
        //    etc. (ver TABLAS_SEED en seedLoader.js) para que cada corrida
        //    parta de cero y el ROOT quede determinísticamente en id_usuario=1.
        // ══════════════════════════════════════════════════════════════════════
        console.log("\n🧹 Reiniciando tablas de datos de prueba...");
        await resetSeedTables();

        // ══════════════════════════════════════════════════════════════════════
        // 2. USUARIO ROOT (misma lógica que usa index.js en cada arranque --
        //    ver seed/ensureRoot.js. Acá siempre lo va a crear, porque la
        //    tabla usuario recién quedó vacía por el reset de arriba.)
        // ══════════════════════════════════════════════════════════════════════
        console.log("\n👤 Verificando/creando usuario ROOT...");
        const rootUser = await ensureRootUser();

        if (rootUser.id_usuario !== 1) {
            console.warn(
                `⚠️  El ROOT quedó con id_usuario=${rootUser.id_usuario} en vez de 1. ` +
                `seed.sql asume id_usuario=1 para el ROOT -- revisa si la secuencia de ` +
                `"usuario" se reinició correctamente antes de continuar.`
            );
        }

        // ══════════════════════════════════════════════════════════════════════
        // 3. DATOS DE PRUEBA (seed.sql)
        // ══════════════════════════════════════════════════════════════════════
        console.log("\n📦 Cargando datos de prueba desde seed.sql...");
        await loadSeedSql();

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
