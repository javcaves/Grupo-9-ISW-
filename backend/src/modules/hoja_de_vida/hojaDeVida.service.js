import { AppDataSource } from "../../config/ConfigDB.js";

const usuarioRepository          = AppDataSource.getRepository("Usuario");
const proyectoUsuarioRepository  = AppDataSource.getRepository("ProyectoUsuario");
const asignacionTareaRepository  = AppDataSource.getRepository("AsignacionTarea");
const asistenciaEmpleadoRepository = AppDataSource.getRepository("AsistenciaEmpleado");
const turnoEmpleadoRepository    = AppDataSource.getRepository("TurnoEmpleado");
const evaluacionDesempenoRepository = AppDataSource.getRepository("EvaluacionDesempeno");

// ============================================================
// SISTEMA DE PUNTAJE (0-100)
// La asistencia pesa igual que la calificación (50% / 50%).
// Si falta uno de los dos componentes, se usa el otro al 100%.
// ============================================================

// Pesos de cada estado de asistencia dentro del ratio de asistencia.
// PRESENTE y FALTA_JUSTIFICADA cuentan completo, ATRASO y RETIRADO cuentan
// la mitad (un atraso resta la mitad que una falta injustificada),
// FALTA_INJUSTIFICADA cuenta cero. EN_ESPERA se excluye del cálculo.
const PESOS_ASISTENCIA = {
    PRESENTE: 1,
    FALTA_JUSTIFICADA: 1,
    ATRASO: 0.5,
    RETIRADO: 0.5,
    FALTA_INJUSTIFICADA: 0,
};

function calcularPuntajeAsistencia(resumenAsistencias) {
    const total = resumenAsistencias.total - resumenAsistencias.enEspera;
    if (total <= 0) return null;

    const puntosPositivos =
        resumenAsistencias.asistido * PESOS_ASISTENCIA.PRESENTE +
        resumenAsistencias.faltaJustificada * PESOS_ASISTENCIA.FALTA_JUSTIFICADA +
        resumenAsistencias.atraso * PESOS_ASISTENCIA.ATRASO +
        resumenAsistencias.retirado * PESOS_ASISTENCIA.RETIRADO +
        resumenAsistencias.faltaInjustificada * PESOS_ASISTENCIA.FALTA_INJUSTIFICADA;

    return Math.round((puntosPositivos / total) * 100 * 10) / 10;
}

function calcularPuntajeCalificacion(promedioGeneral) {
    if (promedioGeneral === null) return null;
    // Escala de calificación asumida 1-5 -> normalizada a 0-100
    return Math.round((parseFloat(promedioGeneral) / 5) * 100 * 10) / 10;
}

function calcularPuntajeFinal(puntajeCalificacion, puntajeAsistencia) {
    if (puntajeCalificacion === null && puntajeAsistencia === null) return null;
    if (puntajeCalificacion === null) return puntajeAsistencia;
    if (puntajeAsistencia === null) return puntajeCalificacion;
    return Math.round((puntajeCalificacion * 0.5 + puntajeAsistencia * 0.5) * 10) / 10;
}

function getNivelPuntaje(puntaje) {
    if (puntaje === null) return null;
    if (puntaje >= 85) return "Excelente";
    if (puntaje >= 70) return "Bueno";
    if (puntaje >= 50) return "Regular";
    return "Necesita Mejorar";
}

function construirResumenAsistencias(asistencias) {
    return {
        total: asistencias.length,
        asistido: asistencias.filter((a) => a.estado === "PRESENTE").length,
        atraso: asistencias.filter((a) => a.estado === "ATRASO").length,
        faltaJustificada: asistencias.filter((a) => a.estado === "FALTA_JUSTIFICADA").length,
        faltaInjustificada: asistencias.filter((a) => a.estado === "FALTA_INJUSTIFICADA").length,
        retirado: asistencias.filter((a) => a.estado === "RETIRADO").length,
        enEspera: asistencias.filter((a) => a.estado === "EN_ESPERA").length,
        ultimas: asistencias.slice(0, 10).map((a) => ({
            fecha: a.asistencia?.fecha,
            hora_ingreso: a.hora_ingreso,
            estado: a.estado,
            descripcion: a.descripcion,
        })),
    };
}

function construirDesempenoPorCategoria(evaluaciones) {
    const porCategoria = {};

    evaluaciones.forEach((e) => {
        const nombreCat = e.tarea?.actividad?.categoria?.nombre || "Sin categoría";
        if (!porCategoria[nombreCat]) {
            porCategoria[nombreCat] = { total: 0, suma: 0, cumplio: 0, noCumplio: 0, evaluaciones: [] };
        }
        porCategoria[nombreCat].total++;
        porCategoria[nombreCat].suma += e.calificacion;

        if (e.cumplio) {
            porCategoria[nombreCat].cumplio++;
        } else {
            porCategoria[nombreCat].noCumplio++;
        }

        porCategoria[nombreCat].evaluaciones.push({
            id_evaluacion: e.id_evaluacion,
            id_tarea: e.tarea?.id_tarea,
            descripcion_tarea: e.tarea?.actividad?.descripcion_esp || "Sin descripción",
            cumplio: e.cumplio,
            calificacion: e.calificacion,
            comentario: e.comentario,
            fecha_evaluacion: e.fecha_evaluacion,
            evaluador: e.evaluador?.nombre || "Desconocido",
        });
    });

    return Object.keys(porCategoria).map((cat) => ({
        categoria: cat,
        promedio: (porCategoria[cat].suma / porCategoria[cat].total).toFixed(1),
        totalEvaluaciones: porCategoria[cat].total,
        cumplio: porCategoria[cat].cumplio,
        noCumplio: porCategoria[cat].noCumplio,
        tasaCumplimiento: porCategoria[cat].total > 0
            ? Math.round((porCategoria[cat].cumplio / porCategoria[cat].total) * 100)
            : 0,
        evaluaciones: porCategoria[cat].evaluaciones,
    }));
}

export const hojaDeVidaService = {
    // ======°°°HOJA DE VIDA GLOBAL°°°=======
    async obtenerHojaDeVida(idEmpleado) {
        try {
            // =========INFORMACION PERSONAL==============
            const usuario = await usuarioRepository.findOne({
                where: { id_usuario: idEmpleado, rol: "EMPLEADO" },
                select: {
                    id_usuario: true,
                    nombre: true,
                    apellido: true,
                    rut: true,
                    email: true,
                    numero: true,
                    fecha_ingreso: true,
                    rol: true,
                    activo: true,
                },
            });

            if (!usuario) {
                return [null, "Empleado no encontrado"];
            }

            // =======PROYECTOS==========
            const proyectosAsignados = await proyectoUsuarioRepository.find({
                where: { id_usuario: idEmpleado },
                relations: { proyecto: true },
                order: { fecha_asignacion: "DESC" },
            });

            const proyectos = proyectosAsignados.map((p) => ({
                id_proyecto: p.id_proyecto,
                nombre: p.proyecto?.nombre_proy || "Sin nombre",
                estado: p.proyecto?.estado || "DESCONOCIDO",
                fecha_asignacion: p.fecha_asignacion,
                fecha_termino: p.fecha_termino,
                activo: p.activo,
            }));

            // ==========ASISTENCIAS=============
            const asistencias = await asistenciaEmpleadoRepository.find({
                where: { id_empleado: idEmpleado },
                relations: { asistencia: true },
                order: { hora_ingreso: "DESC" },
            });

            const resumenAsistencias = construirResumenAsistencias(asistencias);

            // =========TURNOS============
            const turnos = await turnoEmpleadoRepository.find({
                where: { id_empleado: idEmpleado, activo: true },
                relations: { turno: true },
                order: { fecha_ingreso: "DESC" },
            });

            const turnosFormateados = turnos.map((t) => ({
                id_turno: t.id_turno,
                fecha_ingreso: t.fecha_ingreso,
                fecha_egreso: t.fecha_egreso,
                hora_ingreso: t.turno?.hora_ingreso,
                hora_salida: t.turno?.hora_salida,
                activo: t.activo,
            }));

            // ======TAREAS ASIGNADAS======
            const tareasAsignadas = await asignacionTareaRepository.find({
                where: { empleado: { id_usuario: idEmpleado } },
                relations: { tarea: { actividad: { categoria: true } } },
                order: { hora_asignacion: "DESC" },
            });

            const tareas = tareasAsignadas.map((ta) => {
                const tarea = ta.tarea;
                const actividad = tarea?.actividad;
                const categoria = actividad?.categoria;
                return {
                    id_tarea: ta.id_tarea,
                    fecha: tarea?.fecha,
                    estado: tarea?.estado || "DESCONOCIDO",
                    descripcion: actividad?.descripcion_esp || "Sin descripción",
                    categoria: categoria?.nombre || "Sin categoría",
                    tipo_asignacion: ta.tipo_asignacion,
                    hora_asignacion: ta.hora_asignacion,
                    comentario: tarea?.comentario,
                };
            });

            // ==========EVALUACION DESEMPEÑO============
            const evaluaciones = await evaluacionDesempenoRepository.find({
                where: { empleado: { id_usuario: idEmpleado }, activo: true },
                relations: { tarea: { actividad: { categoria: true } }, evaluador: true },
                order: { fecha_evaluacion: "DESC" },
            });

            const desempenoPorCategoria = construirDesempenoPorCategoria(evaluaciones);

            // ======DESEMPEÑO GENERAL======
            const todasCalificaciones = evaluaciones.map((e) => e.calificacion);
            const promedioGeneral = todasCalificaciones.length > 0
                ? (todasCalificaciones.reduce((a, b) => a + b, 0) / todasCalificaciones.length).toFixed(1)
                : null;
            const totalCumplio = evaluaciones.filter((e) => e.cumplio).length;
            const totalNoCumplio = evaluaciones.filter((e) => !e.cumplio).length;

            // ======PUNTAJE 0-100======
            const puntajeCalificacion = calcularPuntajeCalificacion(promedioGeneral);
            const puntajeAsistencia = calcularPuntajeAsistencia(resumenAsistencias);
            const puntajeFinal = calcularPuntajeFinal(puntajeCalificacion, puntajeAsistencia);

            // ======RESPUESTA========
            const resultado = {
                informacionPersonal: {
                    id: usuario.id_usuario,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    rut: usuario.rut,
                    email: usuario.email,
                    numero: usuario.numero || null,
                    fecha_ingreso: usuario.fecha_ingreso,
                    rol: usuario.rol,
                    activo: usuario.activo,
                },
                proyectos,
                asistencias: resumenAsistencias,
                turnos: turnosFormateados,
                tareas,
                evaluaciones: {
                    porCategoria: desempenoPorCategoria,
                    resumen: {
                        total: evaluaciones.length,
                        cumplio: totalCumplio,
                        noCumplio: totalNoCumplio,
                        tasaCumplimiento: evaluaciones.length > 0
                            ? Math.round((totalCumplio / evaluaciones.length) * 100)
                            : 0,
                        ultimas: evaluaciones.slice(0, 5).map((e) => ({
                            id_evaluacion: e.id_evaluacion,
                            tarea: e.tarea?.actividad?.descripcion_esp || "Sin descripción",
                            cumplio: e.cumplio,
                            calificacion: e.calificacion,
                            comentario: e.comentario,
                            fecha: e.fecha_evaluacion,
                            evaluador: e.evaluador?.nombre || "Desconocido",
                        })),
                    },
                },
                desempenoGeneral: {
                    promedio: promedioGeneral,
                    nivel: getNivelPuntaje(puntajeFinal),
                    totalCalificaciones: todasCalificaciones.length,
                },
                puntaje: {
                    final: puntajeFinal,
                    calificacion: puntajeCalificacion,
                    asistencia: puntajeAsistencia,
                    nivel: getNivelPuntaje(puntajeFinal),
                },
                resumen: {
                    totalProyectos: proyectos.length,
                    totalTareas: tareas.length,
                    totalAsistencias: asistencias.length,
                    totalEvaluaciones: evaluaciones.length,
                    tasaAsistencia: puntajeAsistencia,
                },
            };

            return [resultado, null];
        } catch (error) {
            console.error("Error en obtenerHojaDeVida:", error);
            return [null, error.message];
        }
    },

    // ======°°°HOJA DE VIDA X PROYECTO°°°=======
    async obtenerHojaDeVidaPorProyecto(idEmpleado, idProyecto) {
        try {
            // =========INFORMACION PERSONAL==============
            const usuario = await usuarioRepository.findOne({
                where: { id_usuario: idEmpleado, rol: "EMPLEADO" },
                select: {
                    id_usuario: true,
                    nombre: true,
                    apellido: true,
                    rut: true,
                    email: true,
                    numero: true,
                    fecha_ingreso: true,
                    rol: true,
                    activo: true,
                },
            });

            if (!usuario) {
                return [null, "Empleado no encontrado"];
            }

            // ==== PROYECTO ESPECÍFICO======
            const proyectoAsignado = await proyectoUsuarioRepository.findOne({
                where: { id_usuario: idEmpleado, id_proyecto: idProyecto },
                relations: { proyecto: true },
            });

            if (!proyectoAsignado) {
                return [null, "El empleado no está asignado a este proyecto"];
            }

            const proyecto = {
                id_proyecto: proyectoAsignado.id_proyecto,
                nombre: proyectoAsignado.proyecto?.nombre_proy || "Sin nombre",
                estado: proyectoAsignado.proyecto?.estado || "DESCONOCIDO",
                fecha_asignacion: proyectoAsignado.fecha_asignacion,
                fecha_termino: proyectoAsignado.fecha_termino,
                activo: proyectoAsignado.activo,
            };

            // =======ASISTENCIAS FILTRADAS X PROYECTO====
            const asistencias = await asistenciaEmpleadoRepository.find({
                where: { id_empleado: idEmpleado },
                relations: { asistencia: true },
                order: { hora_ingreso: "DESC" },
            });

            const asistenciasFiltradas = asistencias.filter(
                (a) => a.asistencia?.id_proyecto === parseInt(idProyecto)
            );

            const resumenAsistencias = construirResumenAsistencias(asistenciasFiltradas);

            // ==========TAREAS FILTRADAS X PROYECTO======
            const tareasAsignadas = await asignacionTareaRepository.find({
                where: { empleado: { id_usuario: idEmpleado } },
                relations: { tarea: { actividad: { categoria: true } } },
                order: { hora_asignacion: "DESC" },
            });

            const tareasFiltradas = tareasAsignadas.filter(
                (ta) => ta.tarea?.actividad?.id_proyecto === parseInt(idProyecto)
            );

            const tareas = tareasFiltradas.map((ta) => {
                const tarea = ta.tarea;
                const actividad = tarea?.actividad;
                const categoria = actividad?.categoria;
                return {
                    id_tarea: ta.id_tarea,
                    fecha: tarea?.fecha,
                    estado: tarea?.estado || "DESCONOCIDO",
                    descripcion: actividad?.descripcion_esp || "Sin descripción",
                    categoria: categoria?.nombre || "Sin categoría",
                    tipo_asignacion: ta.tipo_asignacion,
                    hora_asignacion: ta.hora_asignacion,
                    comentario: tarea?.comentario,
                };
            });

            // =======TURNOS FILTRADOS X PROYECTO=====
            const turnos = await turnoEmpleadoRepository.find({
                where: { id_empleado: idEmpleado, activo: true },
                relations: { turno: true },
                order: { fecha_ingreso: "DESC" },
            });

            const turnosFiltrados = turnos.filter((t) => t.turno?.id_proyecto === parseInt(idProyecto));

            const turnosFormateados = turnosFiltrados.map((t) => ({
                id_turno: t.id_turno,
                fecha_ingreso: t.fecha_ingreso,
                fecha_egreso: t.fecha_egreso,
                hora_ingreso: t.turno?.hora_ingreso,
                hora_salida: t.turno?.hora_salida,
                activo: t.activo,
            }));

            // ========EVALUACIONES FILTRADAS X PROYECTO========
            const evaluaciones = await evaluacionDesempenoRepository.find({
                where: { empleado: { id_usuario: idEmpleado }, activo: true },
                relations: { tarea: { actividad: { categoria: true } }, evaluador: true },
                order: { fecha_evaluacion: "DESC" },
            });

            const evaluacionesFiltradas = evaluaciones.filter(
                (e) => e.tarea?.actividad?.id_proyecto === parseInt(idProyecto)
            );

            const desempenoPorCategoria = construirDesempenoPorCategoria(evaluacionesFiltradas);

            // ======DESEMPEÑO GENERAL======
            const todasCalificaciones = evaluacionesFiltradas.map((e) => e.calificacion);
            const promedioGeneral = todasCalificaciones.length > 0
                ? (todasCalificaciones.reduce((a, b) => a + b, 0) / todasCalificaciones.length).toFixed(1)
                : null;
            const totalCumplio = evaluacionesFiltradas.filter((e) => e.cumplio).length;
            const totalNoCumplio = evaluacionesFiltradas.filter((e) => !e.cumplio).length;

            // ======PUNTAJE 0-100======
            const puntajeCalificacion = calcularPuntajeCalificacion(promedioGeneral);
            const puntajeAsistencia = calcularPuntajeAsistencia(resumenAsistencias);
            const puntajeFinal = calcularPuntajeFinal(puntajeCalificacion, puntajeAsistencia);

            // ======RESPUESTA========
            const resultado = {
                proyecto,
                informacionPersonal: {
                    id: usuario.id_usuario,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    rut: usuario.rut,
                    email: usuario.email,
                    numero: usuario.numero || null,
                    fecha_ingreso: usuario.fecha_ingreso,
                    rol: usuario.rol,
                    activo: usuario.activo,
                },
                asistencias: resumenAsistencias,
                turnos: turnosFormateados,
                tareas,
                evaluaciones: {
                    porCategoria: desempenoPorCategoria,
                    resumen: {
                        total: evaluacionesFiltradas.length,
                        cumplio: totalCumplio,
                        noCumplio: totalNoCumplio,
                        tasaCumplimiento: evaluacionesFiltradas.length > 0
                            ? Math.round((totalCumplio / evaluacionesFiltradas.length) * 100)
                            : 0,
                        ultimas: evaluacionesFiltradas.slice(0, 5).map((e) => ({
                            id_evaluacion: e.id_evaluacion,
                            tarea: e.tarea?.actividad?.descripcion_esp || "Sin descripción",
                            cumplio: e.cumplio,
                            calificacion: e.calificacion,
                            comentario: e.comentario,
                            fecha: e.fecha_evaluacion,
                            evaluador: e.evaluador?.nombre || "Desconocido",
                        })),
                    },
                },
                desempenoGeneral: {
                    promedio: promedioGeneral,
                    nivel: getNivelPuntaje(puntajeFinal),
                    totalCalificaciones: todasCalificaciones.length,
                },
                puntaje: {
                    final: puntajeFinal,
                    calificacion: puntajeCalificacion,
                    asistencia: puntajeAsistencia,
                    nivel: getNivelPuntaje(puntajeFinal),
                },
                resumen: {
                    totalTareas: tareas.length,
                    totalAsistencias: asistenciasFiltradas.length,
                    totalEvaluaciones: evaluacionesFiltradas.length,
                    tasaAsistencia: puntajeAsistencia,
                },
            };

            return [resultado, null];
        } catch (error) {
            console.error("Error en obtenerHojaDeVidaPorProyecto:", error);
            return [null, error.message];
        }
    },
};