//Esto quiza lo creo la persona que esta a cargo del usuario asi que hay que comparar, lo hice para guiarme mientras

import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { AppDataSource } from "./configBd.js";
const JWT_SECRET = process.env.JWT_SECRET;//.env

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies.jwt;
    }
    return token;
};

const options = {
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: JWT_SECRET,
};

export const passportJwtSetup = () => {
    passport.use(
        new JwtStrategy(options, async (payload, done) => {
            try {
                const userRepository = AppDataSource.getRepository("Usuario");
                const user = await userRepository.findOne({
                    where: { id_usuario: payload.id },
                });

                if (user && user.activo) {
                    return done(null, {
                        id: user.id_usuario,
                        email: user.email,   
                        rol: user.rol,
                        nombre: user.nombre,
                        apellido: user.apellido
                    });
                } else {
                    return done(null, false);
                }
            } catch (error) {
                return done(error, false);
            }
        })
    );
};