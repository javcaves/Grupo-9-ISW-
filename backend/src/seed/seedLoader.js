// src/seedLoader.js
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { AppDataSource } from "../config/ConfigDB.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const SEED_SQL_PATH = join(__dirname, "seed.sql");

// Todas las tablas que toca seed.sql, en un orden cualquiera -- CASCADE se
// encarga de las dependencias de FK. RESTART IDENTITY reinicia las
// secuencias SERIAL, así el próximo usuario creado (el ROOT) siempre cae
// en id_usuario = 1, que es justo lo que seed.sql asume para poder
// referenciarlo desde las demás tablas sin tener que parametrizarlo.
const TABLAS_SEED = [
    "notificacion",
    "movimiento_inventario",
    "item_proyecto",
    "item",
    "calificacion_empleado",
    "solicitud_asistencia",
    "asistencia_empleado",
    "asistencia",
    "turno_empleado",
    "turno",
    "evaluacion_desempeno",
    "asignacion_tarea",
    "programar_tarea",
    "actividad",
    "categoria",
    "proyecto_usuario",
    "proyecto",
    "usuario",
];

/**
 * Vacía TODAS las tablas que va a repoblar el seed (incluida "usuario",
 * o sea también el ROOT). Debe llamarse ANTES de crear el ROOT en seed.js,
 * para que el ROOT recién creado quede con id_usuario = 1 de forma
 * determinística en cada corrida.
 *
 * ⚠️ Esto es destructivo: borra todo el contenido de estas tablas cada vez
 * que se ejecuta `npm run seed` (o equivalente). Ya no es un upsert
 * no-destructivo como el loader anterior basado en minimal_seed.json --
 * es un reset completo pensado para entornos de desarrollo/demo.
 */
export async function resetSeedTables() {
    console.log("  🧹 Reiniciando tablas antes de sembrar datos...");
    const listado = TABLAS_SEED.map(t => `"${t}"`).join(", ");
    await AppDataSource.query(`TRUNCATE TABLE ${listado} RESTART IDENTITY CASCADE;`);
    console.log("  ✅ Tablas vacías y secuencias reiniciadas.");
}

/**
 * Ejecuta seed.sql completo (incluye su propio BEGIN/COMMIT) en una sola
 * llamada. El archivo ya trae los valores literales (incluido el hash
 * bcrypt de la contraseña de prueba), así que no requiere inyectar nada
 * en runtime -- a diferencia del loader anterior basado en JSON.
 */
export async function loadSeedSql() {
    let sql;
    try {
        sql = readFileSync(SEED_SQL_PATH, "utf-8");
    } catch (err) {
        throw new Error(`❌ No se pudo leer el seed en "${SEED_SQL_PATH}": ${err.message}`);
    }

    console.log("  📦 Ejecutando seed.sql...");
    await AppDataSource.query(sql);
    console.log("  ✅ seed.sql ejecutado correctamente.");
}
