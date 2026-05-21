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

const options = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: JWT_SECRET,
};

// Esta es la función que tu app.js quiere ejecutar para inicializar la estrategia
export const passportJwtSetup = () => {
    passport.use(
        new JwtStrategy(options, async (jwtPayload, done) => {
            try {
                const userRepository = AppDataSource.getRepository("Usuario");
                const user = await userRepository.findOne({ where: { id_usuario: jwtPayload.id } });

                if (user) {
                    return done(null, user); // Inyecta el usuario en req.user
                }
                
                return done(null, false, { message: "Usuario no encontrado en el sistema o dado de baja." });
            } catch (error) {
                return done(error, false);
            }
        })
    );
};