import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/ConfigEnv.js";
import { AppDataSource } from "../config/ConfigDB.js";
import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import bcrypt from "bcrypt";

export const login = async (req, res) => {
    // Recibimos 'identifier' en lugar de 'email' para soportar RUT o Correo
    const { identifier, password } = req.body;

    try {
        if (!identifier || !password) {
            return handleErrorClient(res, 400, "Datos incompletos", "Debe proporcionar un correo/RUT y una contraseña.");
        }

        const isEmail = identifier.includes('@');
        const cleanIdentifier = isEmail ? identifier: identifier.replace(/\./g, "").trim();

        const userRepository = AppDataSource.getRepository("Usuario");

        const user = await userRepository.findOne({
            select: {
                id_usuario: true,
                nombre: true,
                email: true,
                rut: true,
                password: true,
                rol: true,
                activo: true
            },
            where: [
                { email: cleanIdentifier },
                { rut: cleanIdentifier }
            ]
        });

        // 1. Validar que exista y esté activo
        if (!user || !user.activo) {
            return handleErrorClient(
                res, 
                401, 
                "Credenciales incorrectas", 
                "El identificador (Correo/RUT) o la contraseña son incorrectos, o la cuenta está inactiva."
            );
        }

        // 2. Validar la contraseña encriptada
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return handleErrorClient(
                res, 
                401, 
                "Credenciales incorrectas", 
                "El identificador (Correo/RUT) o la contraseña son incorrectos."
            );
        }

        const payload = { 
            id_usuario: user.id_usuario,
            rol: user.rol
        };

        // 4. Firmar el token JWT
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

        // 5. Guardar el token en la cookie 'jwt'
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 24 * 60 * 60 * 1000 
        });

        // 6. Retornar respuesta exitosa al Frontend
        return res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            user: {
                id_usuario: user.id_usuario, 
                nombre: user.nombre,
                rol: user.rol
            }
        });

    } catch (error) {
        return handleErrorServer(res, 500, "Error en el proceso de login", error.message);
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
        });
        
        return res.json({
            success: true,
            message: "Sesión cerrada correctamente"
        });
    } catch (error) {
        return handleErrorServer(res, 500, "Error al cerrar sesión", error.message);
    }
};