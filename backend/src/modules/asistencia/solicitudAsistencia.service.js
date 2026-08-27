import { AppDataSource } from "../../config/ConfigDB.js";
import * as NotificacionService from "../notificaciones/notificacion.service.js";

const solicitudRepo = () => AppDataSource.getRepository("SolicitudAsistencia");
const asistenciaEmpleadoRepo = () => AppDataSource.getRepository("AsistenciaEmpleado");
const asistenciaRepo = () => AppDataSource.getRepository("Asistencia");

export const crearSolicitud = async (id_empleado, data) => {
    try {
        const registro = await asistenciaEmpleadoRepo().findOne({
            where: { id_asistencia: data.id_asistencia, id_empleado, activo: true },
        });
        if (!registro) return [null, "No tienes un registro de asistencia asociado a esa jornada."];

        const yaPendiente = await solicitudRepo().findOne({
            where: { id_asistencia: data.id_asistencia, id_empleado, estado_solicitud: "PENDIENTE" },
        });
        if (yaPendiente) return [null, "Ya tienes una solicitud pendiente para esta asistencia."];

        const nueva = solicitudRepo().create({
            id_asistencia: data.id_asistencia,
            id_empleado,
            estado_solicitado: data.estado_solicitado || null,
            hora_ingreso_solicitada: data.hora_ingreso_solicitada || null,
            hora_egreso_solicitada: data.hora_egreso_solicitada || null,
            motivo: data.motivo,
            estado_solicitud: "PENDIENTE",
        });

        const guardada = await solicitudRepo().save(nueva);

        // Buscamos el proyecto de esta asistencia para saber a quién notificar
        const asistencia = await asistenciaRepo().findOne({
            where: { id_asistencia: data.id_asistencia },
            relations: { proyecto: true },
        });

        if (asistencia?.proyecto?.id_proyecto) {
            const [, errNotif] = await NotificacionService.notificarSolicitudAsistenciaPendiente(
                guardada,
                asistencia.proyecto.id_proyecto
            );
            if (errNotif) console.error("error al notificar solicitud de asistencia:", errNotif);
        }

        return [guardada, null];
    } catch (error) {
        console.error("Error en crearSolicitud (asistencia):", error);
        return [null, "Error interno al crear la solicitud."];
    }
};

export const listarPendientes = async () => {
    return await solicitudRepo().find({
        where: { estado_solicitud: "PENDIENTE" },
        order: { fecha_solicitud: "ASC" },
    });
};

export const listarMias = async (id_empleado) => {
    return await solicitudRepo().find({
        where: { id_empleado },
        order: { fecha_solicitud: "DESC" },
    });
};

export const resolverSolicitud = async (id_solicitud, decision, id_resuelve) => {
    try {
        const solicitud = await solicitudRepo().findOne({ where: { id_solicitud } });
        if (!solicitud) return [null, "Solicitud no encontrada."];
        if (solicitud.estado_solicitud !== "PENDIENTE") return [null, "Esta solicitud ya fue resuelta."];

        if (decision === "APROBADO") {
            const registro = await asistenciaEmpleadoRepo().findOne({
                where: { id_asistencia: solicitud.id_asistencia, id_empleado: solicitud.id_empleado, activo: true },
            });
            if (!registro) return [null, "El registro de asistencia original ya no existe."];
            if (registro.estado === "FALTA_JUSTIFICADA") {
                return [null, "Regla de negocio: no se puede editar un registro en estado FALTA_JUSTIFICADA."];
            }

            // Turno para validar contra el horario asignado
            const asistencia = await asistenciaRepo().findOne({
                where: { id_asistencia: solicitud.id_asistencia },
                relations: { turno: true },
            });
            const turno = asistencia?.turno;

            const aMinutos = (t) => {
                if (!t) return null;
                const [h, m] = String(t).split(":").map(Number);
                if (Number.isNaN(h) || Number.isNaN(m)) return null;
                return h * 60 + m;
            };

            // Horas resultantes tras aplicar la corrección (solicitadas o actuales)
            const ingresoEff = solicitud.hora_ingreso_solicitada || registro.hora_ingreso;
            const egresoEff  = solicitud.hora_egreso_solicitada  || registro.hora_egreso;
            const minIngreso = aMinutos(ingresoEff);
            const minEgreso  = aMinutos(egresoEff);

            // Validaciones de coherencia (bug #2) -- mismas reglas que la edición directa
            if (egresoEff && !ingresoEff) {
                return [null, "No se puede registrar una hora de egreso sin una hora de ingreso."];
            }
            if (minIngreso != null && minEgreso != null && minEgreso < minIngreso) {
                return [null, "La hora de egreso no puede ser anterior a la hora de ingreso."];
            }
            if (turno && minIngreso != null) {
                const minSalidaTurno = aMinutos(turno.hora_salida);
                if (minSalidaTurno != null && minIngreso > minSalidaTurno) {
                    return [null, "La hora de ingreso no puede ser posterior a la hora de salida del turno."];
                }
            }

            // Aplicar horas
            if (solicitud.hora_ingreso_solicitada) registro.hora_ingreso = solicitud.hora_ingreso_solicitada;
            if (solicitud.hora_egreso_solicitada)  registro.hora_egreso  = solicitud.hora_egreso_solicitada;

            // Estado coherente (bug #4): si viene explícito se respeta; si no, se
            // deriva para no quedar con ingreso pero estado EN_ESPERA, o con
            // salida marcada sin cerrar el día (lo que dejaba el QR activo).
            if (solicitud.estado_solicitado) {
                registro.estado = solicitud.estado_solicitado;
            } else if (registro.hora_egreso) {
                registro.estado = "RETIRADO";
            } else if (registro.hora_ingreso) {
                const minTurnoIngreso = aMinutos(turno?.hora_ingreso);
                registro.estado = (minTurnoIngreso != null && aMinutos(registro.hora_ingreso) <= minTurnoIngreso + 10)
                    ? "PRESENTE"
                    : "ATRASO";
            }

            registro.editado_por = id_resuelve;
            registro.fecha_edicion = new Date();
            await asistenciaEmpleadoRepo().save(registro);
        }

        solicitud.estado_solicitud = decision;
        solicitud.fecha_resolucion = new Date();
        solicitud.resuelto_por = id_resuelve;
        const actualizada = await solicitudRepo().save(solicitud);

        const [, errNotif] = await NotificacionService.marcarResueltasPorReferencia({
            tipo_referencia: "SOLICITUD_ASISTENCIA",
            id_referencia: id_solicitud,
        });
        if (errNotif) console.error("error al marcar notificacion de asistencia resuelta:", errNotif);

        return [actualizada, null];
    } catch (error) {
        console.error("Error en resolverSolicitud (asistencia):", error);
        return [null, "Error interno al resolver la solicitud."];
    }
};