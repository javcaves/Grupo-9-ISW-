import app from './app.js';

import { connectDB } from './config/ConfigDB.js';
import { ensureRootUser } from './seed/ensureRoot.js';
import { iniciarSchedulerTareas } from './scheduler/tareaScheduler.js';

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
        // GARANTIZAR USUARIO ROOT
        // =============================
        // Corre en CADA arranque, sin depender del seed. Si el ROOT ya
        // existe, no hace nada; si no existe, lo crea. Esto asegura que
        // el sistema siempre tenga un ROOT utilizable incluso si nunca se
        // corrió `npm run seed` (o si el seed se elimina más adelante).
        await ensureRootUser();


        // =============================
        // SCHEDULER DE TAREAS
        // =============================
        // Revisa periódicamente y pasa a EN_PROCESO las tareas asignadas
        // cuya fecha/hora programada ya se cumplió.
        iniciarSchedulerTareas();


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
