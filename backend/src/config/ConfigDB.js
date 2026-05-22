import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, PASSWORD, HOST } from "./ConfigEnv.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 1. Importación explícita de emergencia para asegurar que Usuario SÍ exista
import Usuario from "../entity/usuario.entity.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const entitiesDir = path.join(__dirname, "../entity");

const entities = [];

// Añadimos manualmente a Usuario al inicio del array para blindarlo
if (Usuario) {
    entities.push(Usuario);
}

async function cargarEntidades() {
    const files = fs.readdirSync(entitiesDir);
    for (const file of files) {
        // Nos saltamos usuario.entity.js porque ya lo importamos manualmente arriba
        if (file.endsWith(".entity.js") && file !== "usuario.entity.js") {
            const modulePath = path.join(entitiesDir, file);
            const module = await import(`file://${modulePath}`);
            const entity = module.default || Object.values(module)[0];
            if (entity) {
                entities.push(entity);
            }
        }
    }
    return entities;
}

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: `${HOST}`,
    port: 5432,
    username: `${DB_USERNAME}`,
    password: `${PASSWORD}`,
    database: `${DATABASE}`,
    entities: entities, // El array que ahora contiene a Usuario sí o sí
    logging: false, 
    synchronize: true
});

export async function connectDB() {
    try {
        await cargarEntidades();
        await AppDataSource.initialize();
        console.log("Conexion a la base de datos exitosa");
        
        // LOG DE CONTROL: Esto nos dirá en la consola si TypeORM de verdad lo registró
        console.log("📊 Modelos registrados en TypeORM:", AppDataSource.entityMetadatas.map(m => m.name));
    } catch (error) {
        console.error("Ocurrio un error en: ", error);
        throw error;
    }
}