// /src/module/asistencia/asistencia.service.js
import { AppDataSource } from "../../config/ConfigDB.js";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";

const asistenciaRepo = AppDataSource.getRepository("Asistencia");
const asistenciaEmpleadoRepo = AppDataSource.getRepository("AsistenciaEmpleado");
const turnoRepo = AppDataSource.getRepository("Turno");
const turnoEmpleadoRepo = AppDataSource.getRepository("TurnoEmpleado");
const proyectoRepo = AppDataSource.getRepository("Proyecto");

// --- HELPERS INTERNOS ---
const convertirAMinutos = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
};

// Fórmula de Haversine para calcular distancia en metros entre dos coordenadas GPS (RF-ASISTENCIA-9)
const calcularDistanciaMetros = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radio de la tierra en metros
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; 
};

// ─────────────────────────────────────────────────────────────────────────────
// RF-ASISTENCIA-1: Crear asistencia (Generar Token/QR + Snapshot)
// ─────────────────────────────────────────────────────────────────────────────
export const crearAsistenciaService = async (id_turno, id_encargado) => {
    const hoy = new Date().toISOString().split("T")[0];

    // 1. Validar que el turno exista y esté activo
    const turno = await turnoRepo.findOne({ where: { id_turno, activo: true }, relations: { proyecto: true } });
    if (!turno) return [null, "El turno especificado no existe o se encuentra inactivo."];

    // 2. Unicidad: No pueden coexistir dos asistencias con igual ID_TURNO y FECHA
    const asistenciaExistente = await asistenciaRepo.findOne({ where: { turno: { id_turno }, fecha: hoy, activo: true } });
    if (asistenciaExistente) return [null, "Ya se generó la asistencia para este turno el día de hoy."];

    // 3. Generar un token PIN corto de 4 caracteres (Alfanumérico en mayúsculas)
    const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Se quitan 'O', 'I', '1', '0' para evitar confusiones visuales
    let token = "";
    for (let i = 0; i < 4; i++) {
        token += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    // Definir expiración basada en la hora de salida del turno
    const ahoraTimestamp = new Date();
    const [hSalida, mSalida] = turno.hora_salida.split(":");
    const tokenExpira = new Date(ahoraTimestamp.getFullYear(), ahoraTimestamp.getMonth(), ahoraTimestamp.getDate(), Number(hSalida), Number(mSalida));

    // 4. Crear cabecera de Asistencia
    const nuevaAsistencia = asistenciaRepo.create({
        encargado: id_encargado,
        proyecto: turno.proyecto.id_proyecto,
        turno: id_turno,
        fecha: hoy,
        token,
        token_expira: tokenExpira,
        activo: true
    });
    const asistenciaGuardada = await asistenciaRepo.save(nuevaAsistencia);

    // 5. Generar Snapshot (Bulk Insert en AsistenciaEmpleado de trabajadores con contrato vigente hoy)
    const empleadosDelTurno = await turnoEmpleadoRepo.find({
        where: {
            turno: { id_turno },
            activo: true,
            fecha_ingreso: LessThanOrEqual(hoy)
        },
        relations: { empleado: true }
    });

    const registrosSnapshot = [];
    for (const te of empleadosDelTurno) {
        // Validar si tiene fecha de egreso configurada y aún no vence
        if (te.fecha_egreso && te.fecha_egreso < hoy) continue;

        const nuevoRegistro = asistenciaEmpleadoRepo.create({
            id_asistencia: asistenciaGuardada.id_asistencia,
            id_empleado: te.empleado.id_usuario,
            estado: "EN_ESPERA", // Estado inicial obligatorio
            activo: true
        });
        registrosSnapshot.push(nuevoRegistro);
    }

    if (registrosSnapshot.length > 0) {
        await asistenciaEmpleadoRepo.save(registrosSnapshot);
    }

    return [asistenciaGuardada, null];
};

// ─────────────────────────────────────────────────────────────────────────────
// RF-ASISTENCIA-2: Mostrar asistencia actual
// ─────────────────────────────────────────────────────────────────────────────
// /src/module/asistencia/asistencia.service.js

export const mostrarAsistenciaActualService = async (id_turno) => {
    const hoy = new Date().toISOString().split("T")[0];

    // 1. Obtener la asistencia de hoy
    const asistencia = await asistenciaRepo.findOne({
        where: { turno: { id_turno }, fecha: hoy, activo: true },
        relations: { turno: true }
    });
    if (!asistencia) return [null, "No se ha inicializado la asistencia para este turno hoy."];

    // =====================================================================
    // LAZY CLOSURE: Simulación del RF-ASISTENCIA-7 On-Demand
    // =====================================================================
    const ahora = new Date();

    // Si ya pasó el tiempo de expiración del turno (hora de salida), pasamos los rezagados a FALTA_INJUSTIFICADA
    if (ahora >= asistencia.token_expira) {
        await asistenciaEmpleadoRepo.update(
            { id_asistencia: asistencia.id_asistencia, estado: "EN_ESPERA", activo: true },
            { estado: "FALTA_INJUSTIFICADA" }
        );
    }
    // =====================================================================

    // 2. Traer los empleados actualizados
    const empleadosInscritos = await asistenciaEmpleadoRepo.find({
        where: { id_asistencia: asistencia.id_asistencia, activo: true },
        relations: { empleado: true }
    });

    return [{ asistencia, empleados: empleadosInscritos }, null];
};

// ─────────────────────────────────────────────────────────────────────────────
// RF-ASISTENCIA-3: Editar registro individual (Jornada Viva)
// ─────────────────────────────────────────────────────────────────────────────
export const editarRegistroAsistenciaService = async (id_asistencia, id_empleado, data, id_encargado) => {
    const registro = await asistenciaEmpleadoRepo.findOne({
        where: { id_asistencia, id_empleado, activo: true },
        relations: {
            asistencia: { turno: true }
        }
    });

    if (!registro) return [null, "El registro de asistencia para este empleado no existe."];
    if (registro.estado === "FALTA_JUSTIFICADA") return [null, "Regla de negocio: No se puede editar un registro en estado FALTA_JUSTIFICADA."];

    // Validar restricción horaria: HORA_INGRESO no puede ser posterior a HORA_SALIDA del turno
    if (data.hora_ingreso) {
        const minIngreso = convertirAMinutos(data.hora_ingreso);
        const minSalidaTurno = convertirAMinutos(registro.asistencia.turno.hora_salida);
        if (minIngreso > minSalidaTurno) {
            return [null, "La hora de ingreso manual no puede superar la hora de salida del turno asignado."];
        }
        registro.hora_ingreso = data.hora_ingreso;
    }

    // Validar hora de egreso (aplicable para historial o cierre de jornada)
    if (data.hora_egreso) {
        const horaIngresoAComparar = data.hora_ingreso || registro.hora_ingreso;
        if (!horaIngresoAComparar) return [null, "No se puede registrar una hora de egreso si el empleado no posee hora de ingreso registrada."];
        
        const minIngreso = convertirAMinutos(horaIngresoAComparar);
        const minEgreso = convertirAMinutos(data.hora_egreso);
        if (minEgreso < minIngreso) return [null, "Validación: La hora de egreso no puede ser anterior a la hora de ingreso."];
        
        registro.hora_egreso = data.hora_egreso;
    }

    if (data.estado) registro.estado = data.estado;
    if (data.descripcion !== undefined) registro.descripcion = data.descripcion;
    
    // Registrar la auditoría exigida
    registro.editado_por = id_encargado;
    registro.fecha_edicion = new Date();

    const actualizado = await asistenciaEmpleadoRepo.save(registro);
    return [actualizado, null];
};

// ─────────────────────────────────────────────────────────────────────────────
// RF-ASISTENCIA-4: Eliminar asistencia completa de un turno
// ─────────────────────────────────────────────────────────────────────────────
export const eliminarAsistenciaTurnoService = async (id_asistencia) => {
    const asistencia = await asistenciaRepo.findOne({ where: { id_asistencia, activo: true } });
    if (!asistencia) return [null, "La asistencia especificada no existe o ya está inactiva."];

    // Validación de bloqueo de borrado si hay personas activas en la jornada
    const registrosHijos = await asistenciaEmpleadoRepo.find({ where: { id_asistencia, activo: true } });
    const tienePersonalMarcado = registrosHijos.some(r => 
        ["PRESENTE", "ATRASO", "RETIRADO", "FALTA_JUSTIFICADA"].includes(r.estado)
    );

    if (tienePersonalMarcado) {
        return [null, "Operación denegada: No se puede eliminar la asistencia si algún empleado ya tiene estados distintos a 'EN_ESPERA' o 'FALTA_INJUSTIFICADA'."];
    }

    // Soft delete en cascada de la cabecera y el snapshot para auditoría
    await asistenciaRepo.update(id_asistencia, { activo: false });
    await asistenciaEmpleadoRepo.update({ id_asistencia }, { activo: false });

    return [{ message: "Asistencia eliminada con éxito. Los registros históricos se preservan deshabilitados." }, null];
};

// ─────────────────────────────────────────────────────────────────────────────
// RF-ASISTENCIA-5: Consultar e Historial (Pasado / Auditoría de RRHH)
// ─────────────────────────────────────────────────────────────────────────────
export const obtenerHistorialService = async (id_proyecto) => {
    return await asistenciaRepo.find({
        where: { proyecto: { id_proyecto }, activo: true },
        order: { fecha: "DESC" },
        relations: { turno: true, encargado: true }
    });
};



// ─────────────────────────────────────────────────────────────────────────────
// RF-ASISTENCIA-6 & RF-ASISTENCIA-9: Registrar Asistencia (Empleado Web)
// ─────────────────────────────────────────────────────────────────────────────
export const marcarAsistenciaEmpleadoService = async (id_empleado, data) => {
    const { token, latitud_emp, longitud_emp } = data;
    const ahora = new Date();
    const horaActualStr = ahora.toTimeString().slice(0, 5); // "HH:MM"

    // 1. Validar validez, existencia y expiración del token
    const asistencia = await asistenciaRepo.findOne({
        where: { token, activo: true },
        relations: { turno: true, proyecto: true }
    });
    if (!asistencia) return [null, "El código token/QR escaneado no es válido."];
    if (ahora > asistencia.token_expira) return [null, "El plazo temporal para este turno ya ha finalizado."];

    // 2. Verificar que el empleado pertenezca al snapshot del turno
    const registro = await asistenciaEmpleadoRepo.findOne({
        where: { id_asistencia: asistencia.id_asistencia, id_empleado, activo: true }
    });
    if (!registro) return [null, "No tienes permitido marcar asistencia en este turno específico."];
    if (registro.estado !== "EN_ESPERA") return [null, "Ya registraste tu marca de asistencia para la jornada actual."];

    // 3. Validación de Geolocalización (RF-ASISTENCIA-9)
    const proyecto = await proyectoRepo.findOne({ where: { id_proyecto: asistencia.proyecto.id_proyecto } });
    
    // Asumiendo que guardas latitud y longitud separadas en tu entidad proyecto o parseas ubicación
    // Ejemplo si guardas "lat,lng" o similar. Pongamos una simulación estándar de coordenadas fijas
    const [proyLat, proyLng] = proyecto.ubicacion ? proyecto.ubicacion.split(",").map(Number) : [0,0];
    const radioPermitidoMeters = 200; // Configurable por proyecto o constante de empresa
    
    let geoVerificada = true;
    if (proyecto.ubicacion) {
        const distancia = calcularDistanciaMetros(latitud_emp, longitud_emp, proyLat, proyLng);
        if (distancia > radioPermitidoMeters) {
            // Regla de contingencia: Si falla (VPN/NAT) se graba con advertencia
            geoVerificada = false; 
        }
    }

    // 4. Calcular Estado Automático basado en el Margen de Tolerancia (Por defecto 10 min)
    const margenToleranciaMin = 10; 
    const minActual = convertirAMinutos(horaActualStr);
    const minIngresoTurno = convertirAMinutos(asistencia.turno.hora_ingreso);

    if (minActual <= (minIngresoTurno + margenToleranciaMin)) {
        registro.estado = "PRESENTE";
    } else {
        registro.estado = "ATRASO";
    }

    registro.hora_ingreso = horaActualStr + ":00";
    registro.geo_verificada = geoVerificada;
    await asistenciaEmpleadoRepo.save(registro);

    return [{ 
        success: true, 
        estado_asignado: registro.estado, 
        geo_verificada,
        mensaje: geoVerificada ? "Asistencia registrada correctamente." : "Registrado con advertencia: Ubicación fuera de rango o privada." 
    }, null];
};

