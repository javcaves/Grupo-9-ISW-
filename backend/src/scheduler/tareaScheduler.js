// Tarea que revisa periódicamente las tareas en estado "ASIGNADA" y, en cuanto 
// se cumple su fecha y hora programada, las pasa automáticamente a "EN_PROCESO".

import { AppDataSource } from '../config/ConfigDB.js';

const INTERVALO_MS = 60 * 1000; // revisa cada 1 minuto

let intervalo = null;

const pad = (n) => String(n).padStart(2, "0");

const _fechaHoraActualLocal = () => {
    const ahora = new Date();
    const fecha = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}`;
    const hora = `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}:${pad(ahora.getSeconds())}`;
    return { fecha, hora };
};

// Revisa y actualiza las tareas cuya fecha/hora ya se cumplió.
export const activarTareasVencidas = async () => {
    if (!AppDataSource.isInitialized) return;

    const tareaRepo = AppDataSource.getRepository("ProgramarTarea");
    const { fecha, hora } = _fechaHoraActualLocal();

    try {
        const resultado = await tareaRepo
            .createQueryBuilder()
            .update("ProgramarTarea")
            .set({ estado: "EN_PROCESO" })
            .where("estado = :estado", { estado: "ASIGNADA" })
            .andWhere("(fecha < :fecha OR (fecha = :fecha AND hora <= :hora))", { fecha, hora })
            .execute();

        const filasActualizadas = resultado?.affected ?? 0;
        if (filasActualizadas > 0) {
            console.log(`[SchedulerTareas] ${filasActualizadas} tarea(s) pasaron automáticamente a EN_PROCESO.`);
        }
    } catch (error) {
        console.error("[SchedulerTareas] Error al activar tareas vencidas:", error.message);
    }
};

// Inicia el chequeo periódico. Se ejecuta una vez de inmediato y luego cada INTERVALO_MS.
export const iniciarSchedulerTareas = () => {
    if (intervalo) return; // evitar doble inicialización

    activarTareasVencidas();
    intervalo = setInterval(activarTareasVencidas, INTERVALO_MS);
    console.log(`[SchedulerTareas] Iniciado (revisión cada ${INTERVALO_MS / 1000}s).`);
};

export const detenerSchedulerTareas = () => {
    if (intervalo) {
        clearInterval(intervalo);
        intervalo = null;
    }
};
