// src/seed/ensureRoot.js
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/ConfigDB.js";

// ── ROOT hardcodeado -- único, no se toca desde ningún endpoint ────────────
const ROOT_RUT      = "11111111-1";
const ROOT_PASSWORD = "admin123";

/**
 * Garantiza que el usuario ROOT exista. Idempotente: si ya existe (buscado
 * por rut), no hace nada y lo retorna tal cual. Si no existe, lo crea.
 *
 * A diferencia del seed.js (que hace un reset completo y siempre parte de
 * cero), esta función está pensada para correr en CADA arranque del
 * servidor (`npm run dev` / `npm start`), sin depender de que el seed se
 * haya ejecutado. Así, aunque el seed se elimine en el futuro, el sistema
 * siempre va a tener un ROOT utilizable.
 */
export async function ensureRootUser() {
    const usuarioRepository = AppDataSource.getRepository("Usuario");

    let rootUser = await usuarioRepository.findOne({ where: { rut: ROOT_RUT } });

    if (rootUser) {
        console.log(`ℹ️  ROOT ya existe (id_usuario=${rootUser.id_usuario}).`);
        return rootUser;
    }

    console.log("👤 ROOT no encontrado -- creando usuario ROOT inicial...");
    const hashedPassword = await bcrypt.hash(ROOT_PASSWORD, 10);

    rootUser = usuarioRepository.create({
        rut:         ROOT_RUT,
        nombre:      "Root",
        apellido:    "Admin",
        password:    hashedPassword,
        observacion: "Usuario administrador inicial generado por el sistema",
        email:       "admin@cleanadmin.com",
        rol:         "ROOT",
        activo:      true,
        numero:      "+56912345678",
    });

    rootUser = await usuarioRepository.save(rootUser);
    console.log("✅ Usuario ROOT creado con ID:", rootUser.id_usuario);
    return rootUser;
}
