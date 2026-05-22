import app from './app.js';

import { connectDB } from './config/ConfigDB.js';

const PORT = process.env.PORT || 3000;


/**
 * Función principal para iniciar servidor + DB
 */
const startServer = async () => {

    try {

        // =============================
        // CONEXIÓN POSTGRESQL
        // =============================

        await connectDB();


        // =============================
        // LEVANTAR EXPRESS
        // =============================

        app.listen(PORT, () => {

            console.log('==============================================');
            console.log('SERVIDOR INICIADO CON ÉXITO');
            console.log(`URL: http://localhost:${PORT}`);
            console.log(`Base de Datos PostgreSQL conectada`);
            console.log(`Fecha: ${new Date().toLocaleString()}`);
            console.log('==============================================');

        });

    } catch (error) {

        console.error('❌ Error crítico al iniciar:', error);
        process.exit(1);
    }
};

startServer();