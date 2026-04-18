import app from './app.js';

const PORT = process.env.PORT || 3000;

/**
 * Función principal para iniciar el servidor.
 */
const startServer = () => {
    try {
        app.listen(PORT, () => {
            console.log('==============================================');
            console.log(`SERVIDOR INICIADO CON ÉXITO`);
            console.log(`URL: http://localhost:${PORT}`);
            console.log(` Base de Datos: Simulación JSON activa`);
            console.log(`Fecha: ${new Date().toLocaleString()}`);
            console.log('==============================================');
        });
    } catch (error) {
        console.error('❌ Error crítico al iniciar el servidor:', error.message);
        process.exit(1);
    }
};


startServer();