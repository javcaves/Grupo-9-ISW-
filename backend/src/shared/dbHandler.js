import pg from 'pg';

// Configuración de conexión (idealmente usa variables de entorno .env)
const pool = new pg.Pool({
    user: process.env.DB_USER || 'tu_usuario',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'tu_base_de_datos',
    password: process.env.DB_PASSWORD || 'tu_password',
    port: process.env.DB_PORT || 5432,
});

const dbHandler = {
    /**
     * Ejecuta una consulta SQL.
     * @param {string} text - El comando SQL (ej: 'SELECT * FROM usuarios WHERE id = $1')
     * @param {Array} params - Los valores para evitar Inyección SQL
     */
    async query(text, params) {
        const start = Date.now();
        try {
            const res = await pool.query(text, params);
            const duration = Date.now() - start;
            console.log('Query ejecutada:', { text, duration, rows: res.rowCount });
            return res;
        } catch (error) {
            console.error('Error en la base de datos:', error);
            throw error;
        }
    }
};

export default dbHandler;