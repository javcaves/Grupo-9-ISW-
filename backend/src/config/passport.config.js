import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import { JWT_SECRET } from "./ConfigEnv.js";
import { AppDataSource } from "./ConfigDB.js";

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies["jwt"]; 
    }
    return token;
};

// Esta es la función que tu app.js quiere ejecutar para inicializar la estrategia
export const passportJwtSetup = () => {
    const options = {
        jwtFromRequest: cookieExtractor,
        secretOrKey: JWT_SECRET,
    };

    passport.use(
        new JwtStrategy(options, async (jwtPayload, done) => {
            try {
                const userRepository = AppDataSource.getRepository("Usuario");
                
                // 🌟 CORREGIDO: Ahora lee 'id_usuario' desde el payload del JWT
                const user = await userRepository.findOne({ where: { id_usuario: jwtPayload.id_usuario } });

                if (user) {
                    return done(null, user); // Inyecta el usuario completo de la BD (con su id_usuario) en req.user
                }
                
                return done(null, false, { message: "Usuario no encontrado en el sistema o dado de baja." });
            } catch (error) {
                return done(error, false);
            }
        })
    );
};