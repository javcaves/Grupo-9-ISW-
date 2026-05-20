import cron from "node-cron";
import { ejecutarCierreAutomaticoAsistencia } from "./module/asistencia/asistencia.service.js";

// Correr la automatización cada minuto para atrapar los turnos que vayan terminando
cron.schedule("* * * * *", async () => {
    try {
        await ejecutarCierreAutomaticoAsistencia();
    } catch (error) {
        console.error("Error en ejecución del Cron Job de asistencia:", error.message);
    }
});