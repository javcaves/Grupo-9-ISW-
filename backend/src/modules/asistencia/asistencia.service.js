// /src/module/asistencia/asistencia.service.js
import { AppDataSource } from "../../config/ConfigDB.js";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { hoyLocal } from "../../shared/dateUtils.js";

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
    const hoy = hoyLocal();

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
    const hoy = hoyLocal();

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

export const finalizarAsistenciaService = async (id_asistencia) => {
    const asistencia = await asistenciaRepo.findOne({ where: { id_asistencia, activo: true } });
    if (!asistencia) return [null, "La asistencia especificada no existe o ya está cerrada."];

    await asistenciaRepo.update(id_asistencia, { activo: false });

    return [{ message: "Jornada cerrada correctamente." }, null];
};

// ─────────────────────────────────────────────────────────────────────────────
// RF-ASISTENCIA-5: Consultar e Historial (Pasado / Auditoría de RRHH)
// ─────────────────────────────────────────────────────────────────────────────
export const obtenerHistorialService = async (id_proyecto) => {
    return await asistenciaRepo.find({
        where: { proyecto: { id_proyecto } },
        order: { fecha: "DESC" },
        relations: { 
            turno: true, 
            encargado: true,
            asistenciaEmpleados: {
                empleado: true
            }
        }
    });
};

// ───────────────────────────────────────────────────────────────
// Historial del empleado por proyecto
// GET /proyecto/:id_proyecto/mis-asistencias
// ───────────────────────────────────────────────────────────────
export const obtenerMisAsistenciasProyectoService = async (
    idEmpleado,
    idProyecto
) => {

    const registros = await asistenciaEmpleadoRepo
        .createQueryBuilder("ae")
        .leftJoinAndSelect("ae.asistencia", "a")
        .leftJoinAndSelect("a.turno", "t")
        .where("ae.id_empleado = :idEmpleado", {
            idEmpleado: Number(idEmpleado)
        })
        .andWhere("a.id_proyecto = :idProyecto", {
            idProyecto: Number(idProyecto)
        })
        .andWhere("ae.activo = true")
        .orderBy("a.fecha", "DESC")
        .getMany();

    const historial = registros.map(registro => ({
        id: registro.id_asistencia,
        fecha: registro.asistencia.fecha,
        estado: registro.estado,
        hora_ingreso: registro.hora_ingreso,
        hora_egreso: registro.hora_egreso,
        descripcion: registro.descripcion,
        turno: registro.asistencia.turno?.nombre
    }));

    return [historial, null];
};


// ─────────────────────────────────────────────────────────────────────────────
// RF-ASISTENCIA-6 & RF-ASISTENCIA-9: Registrar Asistencia (Empleado Web)
//
// IMPORTANTE (fix seguridad):
// - El token NUNCA debe llegar aquí desde una pantalla que el propio empleado
//   controle: solo es válido si viene de leer el QR que el encargado muestra
//   en su dispositivo. Este service no puede verificar "quién mostró el QR",
//   así que la barrera real de presencia física es la geolocalización de
//   abajo, que ahora SÍ bloquea (antes solo advertía).
// - `tipo` distingue marca de ENTRADA (EN_ESPERA -> PRESENTE/ATRASO) de
//   SALIDA (PRESENTE/ATRASO -> RETIRADO, registra hora_egreso).
// ─────────────────────────────────────────────────────────────────────────────
export const marcarAsistenciaEmpleadoService = async (id_empleado, data) => {
    const { token, latitud_emp, longitud_emp, tipo = "ENTRADA" } = data;
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

    // 3. Validar la transición de estado según el tipo de marcaje
    if (tipo === "SALIDA") {
        if (!["PRESENTE", "ATRASO"].includes(registro.estado)) {
            return [null, "Debes registrar tu entrada antes de poder marcar la salida."];
        }
        if (registro.hora_egreso) {
            return [null, "Ya registraste tu salida para la jornada actual."];
        }
    } else {
        if (registro.estado !== "EN_ESPERA") {
            return [null, "Ya registraste tu marca de entrada para la jornada actual."];
        }
    }

    // 4. Validación de Geolocalización (RF-ASISTENCIA-9)
    // El proyecto guarda "ubicacion" como dirección de texto libre (ej: "Santiago, Chile"),
    // NO como coordenadas — por eso se usan columnas numéricas dedicadas (latitud/longitud).
    const proyecto = await proyectoRepo.findOne({ where: { id_proyecto: asistencia.proyecto.id_proyecto } });

    const tieneCoordenadas =
        proyecto.latitud !== null && proyecto.latitud !== undefined &&
        proyecto.longitud !== null && proyecto.longitud !== undefined;

    if (!tieneCoordenadas) {
        // Fail-safe: si el proyecto no tiene coordenadas configuradas, no hay forma
        // de verificar presencia física, así que se rechaza en vez de asumir válido.
        return [null, "El proyecto no tiene coordenadas configuradas; no es posible validar la ubicación. Contacta a un administrador."];
    }

    const radioPermitidoMeters = proyecto.radio_geocerca ?? 200;
    const distancia = calcularDistanciaMetros(
        Number(latitud_emp), Number(longitud_emp),
        Number(proyecto.latitud), Number(proyecto.longitud)
    );

    if (distancia > radioPermitidoMeters) {
        return [null, `Estás a ${Math.round(distancia)} m del proyecto (máximo permitido: ${radioPermitidoMeters} m). No es posible registrar la asistencia fuera de la faena.`];
    }

    // 5. Aplicar el marcaje
    if (tipo === "SALIDA") {
        registro.hora_egreso = horaActualStr + ":00";
        registro.estado = "RETIRADO";
    } else {
        // Estado automático basado en el margen de tolerancia (por defecto 10 min)
        const margenToleranciaMin = 10;
        const minActual = convertirAMinutos(horaActualStr);
        const minIngresoTurno = convertirAMinutos(asistencia.turno.hora_ingreso);

        registro.estado = minActual <= (minIngresoTurno + margenToleranciaMin) ? "PRESENTE" : "ATRASO";
        registro.hora_ingreso = horaActualStr + ":00";
    }

    registro.geo_verificada = true;
    await asistenciaEmpleadoRepo.save(registro);

    return [{
        success: true,
        tipo,
        estado_asignado: registro.estado,
        geo_verificada: true,
        distancia_metros: Math.round(distancia),
        mensaje: tipo === "SALIDA" ? "Salida registrada correctamente." : "Asistencia registrada correctamente."
    }, null];
};


// ─────────────────────────────────────────────────────────────────────────────
// RF-ASISTENCIA-7: Obtener historial del empleado en su proyecto actual
// ─────────────────────────────────────────────────────────────────────────────
export const obtenerMiHistorialService = async (id_usuario) => {
    try {

        // Buscar el turno activo del empleado
        const turnoEmpleado = await turnoEmpleadoRepo.findOne({
            where: {
                empleado: {
                    id_usuario
                },
                activo: true
            },
            relations: {
                turno: {
                    proyecto: true
                }
            }
        });

        if (!turnoEmpleado) {
            return [[], null];
        }

        const idProyecto = turnoEmpleado.turno.proyecto.id_proyecto;

        // Obtener todas las asistencias del proyecto
        const asistencias = await asistenciaRepo.find({
            where: {
                proyecto: {
                    id_proyecto: idProyecto
                },
                activo: true
            },
            order: {
                fecha: "DESC"
            }
        });

        const resultado = [];

        for (const asistencia of asistencias) {

            const registro = await asistenciaEmpleadoRepo.findOne({
                where: {
                    id_asistencia: asistencia.id_asistencia,
                    id_empleado: id_usuario,
                    activo: true
                }
            });

            if (!registro) continue;

            resultado.push({
                id_asistencia: asistencia.id_asistencia,
                fecha: asistencia.fecha,
                estado: registro.estado,
                hora_ingreso: registro.hora_ingreso,
                hora_egreso: registro.hora_egreso,
                descripcion: registro.descripcion
            });
        }

        return [resultado, null];

    } catch (error) {
        return [null, error.message];
    }
};



// ─────────────────────────────────────────────────────────────────────────────
// NUEVO: Obtener asistencia de hoy controlando rangos de turno y tolerancia
// ─────────────────────────────────────────────────────────────────────────────
export async function obtenerMiAsistenciaActual(idEmpleado, idTurno) {
    try {
        // 1. OBTENER LA FECHA LOCAL (mismo criterio que el resto del backend,
        // ver shared/dateUtils.js -- ya no hace falta ningún truco de offset
        // manual una vez que process.env.TZ está fijado en ConfigEnv.js).
        const hoyStr = hoyLocal();
        const diaSemana = new Date().getDay(); // 0 = Domingo, 6 = Sábado

        // 2. BUSCAR SI YA EXISTE UN REGISTRO EN EL SNAPSHOT DE HOY (Asistencia ya iniciada)
        const registro = await asistenciaEmpleadoRepo
            .createQueryBuilder("ae")
            .leftJoinAndSelect("ae.asistencia", "asistencia")
            .leftJoinAndSelect("asistencia.turno", "turno")
            .where("ae.id_empleado = :idEmpleado", { idEmpleado: Number(idEmpleado) })
            .andWhere("asistencia.id_turno = :idTurno", { idTurno: Number(idTurno) })
            .andWhere("asistencia.fecha = :hoyStr", { hoyStr }) 
            .andWhere("ae.activo = true")
            .getOne();

        // CASO A: El empleado ya figura en la jornada de hoy (tiene marcas o está en espera activo)
        if (registro) {
            const asignacionContrato = await turnoEmpleadoRepo.findOne({
                where: { turno: { id_turno: Number(idTurno) }, empleado: { id_usuario: Number(idEmpleado) }, activo: true }
            });

            // Inyectamos las colaciones reales del contrato dinámicamente en el objeto
            if (asignacionContrato && registro.asistencia?.turno) {
                registro.asistencia.turno.hora_inicio_colacion = asignacionContrato.inicio_colacion;
                registro.asistencia.turno.hora_fin_colacion = asignacionContrato.fin_colacion;
            }

            // FIX SEGURIDAD: el token/QR nunca debe llegar al cliente del empleado.
            // Solo debe existir en la pantalla de control del encargado. Si viajara
            // aquí, cualquiera podría leerlo desde el Network tab y compartirlo.
            const registroSinToken = {
                ...registro,
                asistencia: registro.asistencia
                    ? (() => {
                          const { token, token_expira, ...asistenciaSegura } = registro.asistencia;
                          return asistenciaSegura;
                      })()
                    : registro.asistencia,
            };

            return {
                success: true,
                code: "MARCA_EXISTENTE",
                data: registroSinToken
            };
        }

        // =====================================================================
        // CASO B: NO HAY MARCA HOY (Buscamos la vinculación contractual activa)
        // =====================================================================
        console.log(`[Asistencia - Predictivo] Buscando vinculación activa para Empleado: ${idEmpleado}, Turno: ${idTurno}`);
        
        const asignacionContrato = await turnoEmpleadoRepo.findOne({
            where: {
                turno: { id_turno: Number(idTurno) },
                empleado: { id_usuario: Number(idEmpleado) },
                activo: true
            },
            relations: {
                turno: true
            }
        });

        // Si existe la vinculación en la tabla intermedia, armamos el esqueleto para que el UIX no se rompa
        if (asignacionContrato) {
            
            // Si es fin de semana, devolvemos la data del turno pero con código restrictivo
            if (diaSemana === 0 || diaSemana === 6) {
                return {
                    success: true,
                    code: "FIN_DE_SEMANA",
                    message: "Fin de semana: No registras jornadas operativas para hoy.",
                    data: {
                        estado: "FUERA_DE_HORARIO",
                        hora_ingreso: "--",
                        hora_egreso: "Inhabilitado",
                        asistencia: {
                            turno: {
                                id_turno: asignacionContrato.turno.id_turno,
                                nombre: asignacionContrato.turno.nombre,
                                hora_ingreso: asignacionContrato.turno.hora_ingreso,
                                hora_salida: asignacionContrato.turno.hora_salida,
                                hora_inicio_colacion: asignacionContrato.inicio_colacion,
                                hora_fin_colacion: asignacionContrato.fin_colacion
                            }
                        }
                    }
                };
            }

            // Día de semana normal, esperando que abran el punto de control QR
            return {
                success: true,
                code: "ESPERANDO_INGRESO",
                message: "Sin marcas de asistencia registradas para la fecha de hoy.",
                data: {
                    estado: "EN_ESPERA",
                    hora_ingreso: "--",
                    hora_egreso: "Pendiente",
                    asistencia: {
                        turno: {
                            id_turno: asignacionContrato.turno.id_turno,
                            nombre: asignacionContrato.turno.nombre,
                            hora_ingreso: asignacionContrato.turno.hora_ingreso,
                            hora_salida: asignacionContrato.turno.hora_salida,
                            hora_inicio_colacion: asignacionContrato.inicio_colacion,
                            hora_fin_colacion: asignacionContrato.fin_colacion
                        }
                    }
                }
            };
        }

        // CASO C: El usuario ni siquiera está en la tabla intermedia asignado a este turno
        return {
            success: true,
            code: "SIN_TURNO_ASIGNADO",
            message: "No registras una vinculación contractual o turno asignado para este proyecto.",
            data: null
        };

    } catch (error) {
        console.error("🔥 Error crítico en obtenerMiAsistenciaActual:", error);
        return { 
            success: false, 
            data: null, 
            error: error.message 
        };
    }
}


export const obtenerMiTurnoService = async (id_usuario) => {
    const turnoEmpleado = await turnoEmpleadoRepo.findOne({
        where: { empleado: { id_usuario: Number(id_usuario) }, activo: true },
        relations: { turno: true }
    });
    if (!turnoEmpleado) return [null, "No tienes un turno activo asignado."];
    return [turnoEmpleado.turno, null];
};