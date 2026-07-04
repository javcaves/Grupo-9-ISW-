// src/seedLoader.js
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/ConfigDB.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const SEED_PATH = join(__dirname, "minimal_seed.json");

// ── Contraseña para todos los usuarios de prueba ──────────────────────────────
//    Cámbiala aquí si el equipo quiere otra. No está hardcodeada en el JSON.
const SEED_PASSWORD = "seed1234";

const SEED_ORDER = [
    {
        entity: "Usuario",
        tableName: "usuario",
        // Conflict por RUT (único de negocio) en vez de id_usuario
        // Así se pisa correctamente aunque el ID haya cambiado en la BD
        pk: ["rut"],
        columns: ["rut","nombre","apellido","password",
                  "observacion","email","numero","rol","fecha_ingreso","activo"],
    },
    {
        entity: "Proyecto",
        tableName: "proyecto",
        pk: ["id_proyecto"],
        columns: ["id_proyecto","nombre_proy","min_emp","max_emp","ubicacion",
                  "fecha_inicio","fecha_termino","estado","activo"],
    },
    {
        entity: "ProyectoUsuario",
        tableName: "proyecto_usuario",
        pk: ["id_proyecto","id_usuario"],
        columns: ["id_proyecto","id_usuario","fecha_asignacion","fecha_termino","activo"],
    },
    {
        entity: "Turno",
        tableName: "turno",
        pk: ["id_turno"],
        columns: ["id_turno","nombre","hora_ingreso","hora_salida",
                  "descripcion","activo","id_proyecto"],
    },
    {
        entity: "TurnoEmpleado",
        tableName: "turno_empleado",
        pk: ["id_turno","id_empleado"],
        columns: ["id_turno","id_empleado","fecha_ingreso","fecha_egreso",
                  "inicio_colacion","fin_colacion","trabaja_feriados","activo"],
    },
    {
        entity: "Categoria",
        tableName: "categoria",
        pk: ["id_cat"],
        columns: ["id_cat","nombre","descripcion","requiere_calificacion","activo"],
    },
    {
        entity: "Item",
        tableName: "item",
        pk: ["id_item"],
        columns: ["id_item","nombre","descripcion","tipo","unidad_medida","control","activo"],
    },
    {
        entity: "ItemProyecto",
        tableName: "item_proyecto",
        pk: ["id_item","id_proyecto"],
        columns: ["id_item","id_proyecto","cantidad","stock_minimo","ultima_revision","activo"],
    },
    {
        entity: "Actividad",
        tableName: "actividad",
        pk: ["id_act"],
        columns: ["id_act","descripcion_esp","recurrencia","activo","id_cat","id_proyecto"],
    },
    {
        entity: "ProgramarTarea",
        tableName: "programar_tarea",
        pk: ["id_tarea"],
        columns: ["id_tarea","fecha","hora","estado","comentario","id_act","id_programador"],
    },
    {
        entity: "AsignacionTarea",
        tableName: "asignacion_tarea",
        pk: ["id_asignacion"],
        columns: ["id_asignacion","tipo_asignacion","hora_asignacion",
                  "id_tarea","id_empleado","id_asignador"],
    },
    {
        entity: "Asistencia",
        tableName: "asistencia",
        pk: ["id_asistencia"],
        columns: ["id_asistencia","fecha","token","token_expira","activo",
                  "id_turno","id_encargado","id_proyecto"],
    },
    {
        entity: "AsistenciaEmpleado",
        tableName: "asistencia_empleado",
        pk: ["id_asistencia","id_empleado"],
        columns: ["id_asistencia","id_empleado","hora_ingreso","hora_egreso",
                  "estado","descripcion","editado_por","fecha_edicion",
                  "geo_verificada","activo"],
    },
    {
        entity: "MovimientoInventario",
        tableName: "movimiento_inventario",
        pk: ["id_mov"],
        columns: ["id_mov","item_sugerido","id_proyecto","id_emisor","id_receptor",
                  "tipo_movimiento","cantidad","fecha","descripcion",
                  "estado_solicitud","id_item"],
    },
    {
        entity: "CalificacionEmpleado",
        tableName: "calificacion_empleado",
        pk: ["id_calificacion"],
        columns: ["id_calificacion","fecha_otorgamiento","activo",
                  "id_cat","id_empleado","id_otorga"],
    },
];

// ── Helpers SQL ───────────────────────────────────────────────────────────────

async function upsertRaw(tableName, pk, columns, raw) {
    const values = columns.map(col => (raw[col] !== undefined ? raw[col] : null));

    const colList    = columns.map(c => `"${c}"`).join(", ");
    const paramList  = columns.map((_, i) => `$${i + 1}`).join(", ");
    const pkConflict = pk.map(c => `"${c}"`).join(", ");

    const updateCols = columns.filter(c => !pk.includes(c));
    const updateSet  = updateCols
        .map(c => `"${c}" = EXCLUDED."${c}"`)
        .join(", ");

    const sql = `
        INSERT INTO "${tableName}" (${colList})
        VALUES (${paramList})
        ON CONFLICT (${pkConflict}) DO UPDATE SET ${updateSet};
    `;

    await AppDataSource.query(sql, values);
}

// ── Función principal ─────────────────────────────────────────────────────────

export async function loadSeed() {
    let seedData;
    try {
        const raw = readFileSync(SEED_PATH, "utf-8");
        seedData  = JSON.parse(raw);
    } catch (err) {
        throw new Error(`❌ No se pudo leer el seed en "${SEED_PATH}": ${err.message}`);
    }

    // Hash generado una sola vez en runtime — no queda en el JSON
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    console.log(`  🔑 Contraseña de prueba: "${SEED_PASSWORD}" → hash generado.`);

    // Inyectar hash e ignorar el id_usuario del JSON
    // (el ID lo asigna la BD; el conflict se resuelve por rut)
    if (seedData.Usuario) {
        seedData.Usuario = seedData.Usuario.map(({ id_usuario, ...u }) => ({
            ...u,
            password: passwordHash,
        }));
    }

    const resumen = [];

    for (const { entity, tableName, pk, columns } of SEED_ORDER) {
        const registros = seedData[entity];

        if (!registros || registros.length === 0) {
            console.log(`  ⚠️  [${entity}] Sin registros en el seed, saltando...`);
            continue;
        }

        let count    = 0;
        let errorMsg = null;

        for (const raw of registros) {
            try {
                await upsertRaw(tableName, pk, columns, raw);
                count++;
            } catch (err) {
                errorMsg = err.message;
                const pkInfo = Object.fromEntries(pk.map(c => [c, raw[c]]));
                console.error(`  ❌ [${entity}] Error en registro ${JSON.stringify(pkInfo)}: ${err.message}`);
                break;
            }
        }

        if (errorMsg) {
            resumen.push({ entity, count, status: "error", error: errorMsg });
        } else {
            console.log(`  ✅ [${entity}] ${count} registro(s) sincronizado(s).`);
            resumen.push({ entity, count, status: "ok" });
        }
    }

    return resumen;
}