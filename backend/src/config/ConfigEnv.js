import dotenv from 'dotenv';
import { fileURLToPath } from 'url'
import path from 'path';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const envFilePath = path.resolve(_dirname, '.env');
dotenv.config({path:envFilePath});

// Fuerza la zona horaria del proceso de Node, sin depender de que el SO/host
// donde se despliegue ya la tenga configurada. Todo el manejo de fechas
// calendario (asistencia, turnos, reportes) asume esta TZ -- ver
// shared/dateUtils.js.
process.env.TZ = process.env.TZ || 'America/Santiago';

export const PORT = process.env.PORT
export const HOST = process.env.HOST
export const DATABASE = process.env.DATABASE
export const DB_USERNAME = process.env.DB_USERNAME
export const PASSWORD = process.env.PASSWORD
export const JWT_SECRET = process.env.JWT_SECRET;