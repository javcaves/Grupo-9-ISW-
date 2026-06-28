import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import { JWT_SECRET } from "./ConfigEnv.js";
import { AppDataSource } from "./ConfigDB.js";

const cookieExtractor = (req) => {
    console.log("🍪 [cookieExtractor] req.cookies:", req?.cookies);

    let token = null;

    if (req && req.cookies) {
        token = req.cookies["jwt"];
    }

    console.log("🔑 [cookieExtractor] token extraído:", token);

    return token;
};

// Esta es la función que tu app.js quiere ejecutar para inicializar la estrategia
export const passportJwtSetup = () => {

    console.log("🚀 Inicializando Passport JWT Strategy...");

    const options = {
        jwtFromRequest: cookieExtractor,
        secretOrKey: JWT_SECRET,
    };

    console.log("⚙️ JWT Options configuradas:", {
        secretDefined: !!JWT_SECRET
    });

    passport.use(
        new JwtStrategy(options, async (jwtPayload, done) => {

            console.log("📦 [JwtStrategy] Payload recibido:", jwtPayload);

            try {
                const userRepository = AppDataSource.getRepository("Usuario");

                console.log("🔎 Buscando usuario con id:", jwtPayload?.id_usuario);

                const user = await userRepository.findOne({
                    where: { id_usuario: jwtPayload.id_usuario }
                });

                console.log("👤 Usuario encontrado en DB:", user ? "SÍ" : "NO");

                if (user) {
                    console.log("✅ Autenticación exitosa para usuario:", user.id_usuario);
                    return done(null, user);
                }

                console.warn("⚠️ Usuario no encontrado o deshabilitado");

                return done(null, false, {
                    message: "Usuario no encontrado en el sistema o dado de baja."
                });

            } catch (error) {
                console.error("💥 Error en JwtStrategy:", error);
                return done(error, false);
            }
        })
    );

    console.log("✅ Passport JWT Strategy registrada correctamente");
};