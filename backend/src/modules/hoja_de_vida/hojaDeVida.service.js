import { AppDataSource } from "../../config/ConfigDB.js";

const usuarioRepository = AppDataSource.getRepository("Usuario");
const proyectoUsuarioRepository =AppDataSource.getRepository("ProyectoUsuario");
const proyectoRepository = AppDataSource.getRepository("Proyecto");
const asignacionTareaRepository = AppDataSource.getRepository("AsignacionTarea");
const programarTareaRepository = AppDataSource.getRepository("ProgramarTarea");
const actividadRepository = AppDataSource.getRepository("Actividad");
const categoriaRepository = AppDataSource.getRepository("Categoria");
const calificacionEmpleadoRepository = AppDataSource.getRepository("CalificacionEmpleado");
const asistenciaEmpleadoRepository = AppDataSource.getRepository("AsistenciaEmpleado");
const turnoEmpleadoRepository = AppDataSource.getRepository("TurnoEmpleado");
const EvaluacionDesempenoRepository = AppDataSource.getRepository("EvaluacionDesempeno");

export const hojaDeVidaService = {
    async obtenerHojaDeVida(idEmpleado){
        try{

            //=========INFORMACION PERSONAL==============
            const usuario = await usuarioRepository.findOne({
                where: {id: id_empleado, rol: "EMPLEADO"},
                select: ["id", "nombre", "apellido", "rut", "email", "numero", "fecha_ingreso", "rol", "activo"]
            });

            if(!usuario){
                return[null, "empleado no encontrado"];
            }

            //=======PROYECTOS==========
            const proyectosAsignados = await proyectoUsuarioRepository.find({
                where: {id_usuario: idEmpleado},
                relations: ["asistencia"],
                order: {hora_ingreso: "DESC"}
            });

            const proyectos = proyectosAsignados.map(p =>({
                id_proyecto: p.id_proyecto,
                nombre: p.proyecto?.nombre_proy || "sin nombre",
                estado: p.proyecto?.estado || "DESCONOCIDO",
                fecha_asignacion: p.fecha_asignacion,
                fecha_termino: p.fecha_termino,
                activo: p.activo
            }));

            //==========ASISTENCIAS=============
            const asistencias = await asistenciaEmpleadoRepository.find({
                where: {id_empleado: idEmpleado},
                relations: ["asistencia"],
                order: {hora_ingreso: "DESC"}
            });

            const resumenAsistencias = {
                total: asistencias.length,
                asistido: asistencias.filter(a => a.estado === "PRESENTE").length,
                atraso: asistencias.filter(a => a.estado === "ATRASO").length,
                faltaJustificada: asistencias.filter(a => a.estado === "FALTA_JUSTIFICADA").length,
                faltaInjustificada: asistencias.filter(a => a.estado === "FALTA_INJUSTIFICADA").length,
                retirado: asistencias.filter(a => a.estado === "RETIRADO").length,
                enEspera: asistencias.filter(a => a.estado === "EN_ESPERA").length,
                ultimas: asistencias.slice(0, 10).map(a=>({
                    fecha: a.asistencia?.fecha,
                    hora_ingreso: a.hora_ingreso,
                    estado: a.estado,
                    descripcion: a.descripcion
                }))
            };

            //=========TURNOS============
            const turnos = await TurnoEmpleadoRepository.find({
                where: {id_empleado: idEmpleado, activo: true},
                relations: ["turno"],
                order: {hora_ingreso: "DESC"}
            });

            const turnosFormateados = turnos.map(t =>({
                id_turno: t.id_turno,
                fecha_ingreso: t.fecha_ingreso,
                fecha_egreso: t.fecha_egreso,
                hora_ingreso: t.turno?.hora_ingreso,
                hora_salida: t.turno?.hora_salida,
                activo: t.activo
            }));

            //======TAREAS ASIGNADAS======
            const tareasAsignadas = await asignacionTareaRepository.find({
                where: { id_empleado: idEmpleado, activo: true },
                relations: ["tarea", "tarea.actividad", "tarea.actividad.categoria"],
                order: { hora_asignacion: "DESC" }
            });

            const tareas = tareasAsignadas.map(ta=>{
                const tarea = ta.tarea;
                const actividad = tarea?.actividad;
                const categoria = actividad?.categoria;
                return{
                    id_tarea: ta.id_tarea,
                    fecha: tarea?.fecha,
                    estado: tarea?.estado || "DESCONOCIDO",
                    descripcion: actividad?.descripcion_esp || "Sin descripción",
                    categoria: categoria?.nombre || "Sin categoría",
                    tipo_asignacion: ta.tipo_asignacion,
                    hora_asignacion: ta.hora_asignacion,
                    comentario: tarea?.comentario
                };
            });

            //==========EVLUACION DESEMPEÑO============
            const evaluaciones = await EvaluacionDesempenoRepository.find({
                where: { 
                    empleado: { id_usuario: idEmpleado }, 
                    activo: true 
                },
                relations: ["tarea", "tarea.actividad", "tarea.actividad.categoria", "evaluador"],
                order: { fecha_evaluacion: "DESC" }
            });
            const evaluacionesPorCategoria = {};

            evaluaciones.forEach(e =>{
                const nombreCat = e.tarea?.actividad?.categoria?.nombre || "Sin categoría";
                if(!evaluacionesPorCategoria[nombreCat]){
                    evaluacionesPorCategoria[nombreCat] = {
                        total: 0,
                        suma: 0,
                        cumplio: 0,
                        noCumplio: 0,
                        evaluaciones: []
                    };
                }
                evaluacionesPorCategoria[nombreCat].total++;
                evaluacionesPorCategoria[nombreCat].suma += e.calificacion;

                if (e.noCumplio){
                    evaluacionesPorCategoria[nombreCat].cumplio++;
                }else{
                    evaluacionesPorCategoria[nombreCat].noCumplio++;
                }

                evaluacionesPorCategoria[nombreCat].push({
                    id_evaluacion: e.id_evaluacion,
                    id_tarea: e.tarea?.id_tarea,
                    descripcion_tarea: e.tarea?.actividad?.descripcion_esp || "Sin descripción",
                    cumplio: e.cumplio,
                    calificacion: e.calificacion,
                    comentario: e.comentario,
                    fecha_evaluacion: e.fecha_evaluacion,
                    evaluador: e.evaluador?.nombre || "Desconocido"
                });
            });

            const desempenoPorCategoria = Object.keys(evaluacionesPorCategoria).map(cat => ({
                categoria: cat,
                promedio: (evaluacionesPorCategoria[cat].suma / evaluacionesPorCategoria[cat].total).toFixed(1),
                totalEvaluaciones: evaluacionesPorCategoria[cat].total,
                cumplio: evaluacionesPorCategoria[cat].cumplio,
                noCumplio: evaluacionesPorCategoria[cat].noCumplio,
                tasaCumplimiento: evaluacionesPorCategoria[cat].total > 0
                    ? Math.round((evaluacionesPorCategoria[cat].cumplio / evaluacionesPorCategoria[cat].total) * 100)
                    : 0,
                evaluaciones: evaluacionesPorCategoria[cat].evaluaciones
            }));

            //======DESEMPEÑO GENERAL, DATOS PUROS======
            const todasCalificaciones = evaluaciones.map(e=> e.calificacion);
            const promedioGeneral = todasCalificaciones.length > 0
                ? (todasCalificaciones.reduce((a, b) => a + b, 0) / todasCalificaciones.length).toFixed(1)
                : null;
            const totalCumplio = evaluaciones.filter(e => e.cumplio).length;
            const totalNoCumplio = evaluaciones.filter(e => !e.cumplio).length;
            const getNivelDesempeno = (prom) =>{
                if (prom === null) return null;
                const p = parseFloat(prom);
                if (p >= 4.5) return "Excelente";
                if (p >= 3.5) return "Bueno";
                if (p >= 2.5) return "Regular";
                return "Necesita Mejorar";
            };

            //======RESPUESTA========
            const resultado = {
                informacionPersonal: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    rut: usuario.rut,
                    email: usuario.email,
                    numero: usuario.numero || null,
                    fecha_ingreso: usuario.fecha_ingreso,
                    rol: usuario.rol,
                    activo: usuario.activo

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
                        ultimas: evaluaciones.slice(0, 5).map(e => ({
                            id_evaluacion: e.id_evaluacion,
                            tarea: e.tarea?.actividad?.descripcion_esp || "Sin descripción",
                            cumplio: e.cumplio,
                            calificacion: e.calificacion,
                            comentario: e.comentario,
                            fecha: e.fecha_evaluacion,
                            evaluador: e.evaluador?.nombre || "Desconocido"
                        }))
                    }
                },
                desempenoGeneral:{
                    promedio: promedioGeneral,
                    nivel: getNivelDesempeno(promedioGeneral),
                    totalCalificaciones: todasCalificaciones.length
                },
                resumen: {
                    totalProyectos: proyectos.length,
                    totalTareas: tareas.length,
                    totalAsistencias: asistencias.length,
                    totalEvaluaciones: evaluaciones.length,
                    tasaAsistencia: asistencias.length > 0
                    ? Math.round((asistencias.filter(a => a.estado === "ASISTIDO").length / asistencias.length) * 100)
                    : null
                }
            };

            return [resultado, null];

        } catch (error){
            console.error("error en obtener hoja de vida service: ", error);
            return [null, error.message];
        }
    },

    async obtenerHojaDeVidaPorProyecto(idEmpleado, idProyecto){
        try{
            //=========INFORMACION PERSONAL (misma funcion que en global)==============
            const usuario = await usuarioRepository.findOne({
                where: {id: id_empleado, rol: "EMPLEADO"},
                select: ["id", "nombre", "apellido", "rut", "email", "numero", "fecha_ingreso", "rol", "activo"]
            });

            if(!usuario){
                return[null, "empleado no encontrado"];
            }
            //==== PROYECTO ESPECIFICO======
            const proyectoAsignado = await proyectoRepository.findOne({
                where: { id_usuario: idEmpleado, id_proyecto: idProyecto },
                relations: ["proyecto"]
            });

            if(!proyectoAsignado){
                return [null, "El empleado no está asignado a este proyecto"];
            }

            const proyecto = {
                id_proyecto: proyectoAsignado.id_proyecto,
                nombre: proyectoAsignado.proyecto?.nombre_proy || "Sin nombre",
                estado: proyectoAsignado.proyecto?.estado || "DESCONOCIDO",
                fecha_asignacion: proyectoAsignado.proyecto?.fecha_asignacion,
                fecha_termino: proyectoAsignado.proyecto?.fecha_termino,
                activo: proyectoAsignado.proyecto?.activo  
            };

            //=======ASISTENCIAS FILTRADAS X PROYECTO====
            //esto es lo mismo q asistencias anterior, cambia en la filtracion
            const asistencias = await asistenciaEmpleadoRepository.find({
                where: {id_empleado: idEmpleado},
                relations: ["asistencia"],
                order: {hora_ingreso: "DESC"}
            });

            //filtracion de asistencias x proyecto
            const asistenciasFiltradas = asistencias.filter(a => 
                a.asistencia?.id_proyecto === parseInt(idProyecto)
            );

            const resumenAsistencias = {
                total: asistenciasFiltradas.length,
                asistido: asistenciasFiltradas.filter(a => a.estado === "PRESENTE").length,
                atraso: asistenciasFiltradas.filter(a => a.estado === "ATRASO").length,
                faltaJustificada: asistenciasFiltradas.filter(a => a.estado === "FALTA_JUSTIFICADA").length,
                faltaInjustificada: asistenciasFiltradas.filter(a => a.estado === "FALTA_INJUSTIFICADA").length,
                retirado: asistenciasFiltradas.filter(a => a.estado === "RETIRADO").length,
                enEspera: asistenciasFiltradas.filter(a => a.estado === "EN_ESPERA").length,
                ultimas: asistenciasFiltradas.slice(0, 10).map(a=>({
                    fecha: a.asistencia?.fecha,
                    hora_ingreso: a.hora_ingreso,
                    estado: a.estado,
                    descripcion: a.descripcion
                }))
            };

            //==========TAREAS FILTRADAS X PROYECTO
            //esto es lo mismo q tareasAsignadas anterior, cambia en la filtracion
            const tareasAsignadas = await asignacionTareaRepository.find({
                where: { id_empleado: idEmpleado, activo: true },
                relations: ["tarea", "tarea.actividad", "tarea.actividad.categoria"],
                order: { hora_asignacion: "DESC" }
            });

            //filtracion de tareasAsignadas x proyecto
            const tareasFiltradas = tareasAsignadas.filter(ta => 
                ta.tarea?.actividad?.id_proyecto === parseInt(idProyecto)
            );

            //misma funcion que en global, solo cambio que mapeo las filtradas en vez de las globales
            const tareas = tareasFiltradas.map(ta=>{
                const tarea = ta.tarea;
                const actividad = tarea?.actividad;
                const categoria = actividad?.categoria;
                return{
                    id_tarea: ta.id_tarea,
                    fecha: tarea?.fecha,
                    estado: tarea?.estado || "DESCONOCIDO",
                    descripcion: actividad?.descripcion_esp || "Sin descripción",
                    categoria: categoria?.nombre || "Sin categoría",
                    tipo_asignacion: ta.tipo_asignacion,
                    hora_asignacion: ta.hora_asignacion,
                    comentario: tarea?.comentario
                };
            });

            //=======TURNOS FILTRADOS X PROYECTO=====
            const turnos = await TurnoEmpleadoRepository.find({
                where: { id_empleado: idEmpleado, activo: true },
                relations: ["turno"],
                order: { fecha_ingreso: "DESC" }
            });

            const turnosFiltrados = turnos.filter(t =>
                t.turno?.id_proyecto === parseInt(idProyecto)
            );

            //misma funcion que en global, solo cambio que mapeo las filtradas en vez de las globales
            const turnosFormateados = turnosFiltrados.map(t => ({
                id_turno: t.id_turno,
                fecha_ingreso: t.fecha_ingreso,
                fecha_egreso: t.fecha_egreso,
                hora_ingreso: t.turno?.hora_ingreso,
                hora_salida: t.turno?.hora_salida,
                activo: t.activo
            }));

            //========CALIFICACIONES FILTRADAS X PROYECTO
           //==========EVLUACION DESEMPEÑO============
            const evaluaciones = await EvaluacionDesempenoRepository.find({
                where: { 
                    empleado: { id_usuario: idEmpleado }, 
                    activo: true 
                },
                relations: ["tarea", "tarea.actividad", "tarea.actividad.categoria", "evaluador"],
                order: { fecha_evaluacion: "DESC" }
            });

            const evaluacionesFiltradas = evaluaciones.filter(e => 
                e.tarea?.actividad?.id_proyecto === parseInt(idProyecto)
            );

            const evaluacionesPorCategoria = {};

           evaluacionesFiltradas.forEach(e =>{
                const nombreCat = e.tarea?.actividad?.categoria?.nombre || "Sin categoría";
                if(!evaluacionesPorCategoria[nombreCat]){
                    evaluacionesPorCategoria[nombreCat] = {
                        total: 0,
                        suma: 0,
                        cumplio: 0,
                        noCumplio: 0,
                        evaluaciones: []
                    };
                }
                evaluacionesPorCategoria[nombreCat].total++;
                evaluacionesPorCategoria[nombreCat].suma += e.calificacion;

                if (e.noCumplio){
                    evaluacionesPorCategoria[nombreCat].cumplio++;
                }else{
                    evaluacionesPorCategoria[nombreCat].noCumplio++;
                }

                evaluacionesPorCategoria[nombreCat].push({
                    id_evaluacion: e.id_evaluacion,
                    id_tarea: e.tarea?.id_tarea,
                    descripcion_tarea: e.tarea?.actividad?.descripcion_esp || "Sin descripción",
                    cumplio: e.cumplio,
                    calificacion: e.calificacion,
                    comentario: e.comentario,
                    fecha_evaluacion: e.fecha_evaluacion,
                    evaluador: e.evaluador?.nombre || "Desconocido"
                });
            });

            const desempenoPorCategoria = Object.keys(evaluacionesPorCategoria).map(cat => ({
                categoria: cat,
                promedio: (evaluacionesPorCategoria[cat].suma / evaluacionesPorCategoria[cat].total).toFixed(1),
                totalEvaluaciones: evaluacionesPorCategoria[cat].total,
                cumplio: evaluacionesPorCategoria[cat].cumplio,
                noCumplio: evaluacionesPorCategoria[cat].noCumplio,
                tasaCumplimiento: evaluacionesPorCategoria[cat].total > 0
                    ? Math.round((evaluacionesPorCategoria[cat].cumplio / evaluacionesPorCategoria[cat].total) * 100)
                    : 0,
                evaluaciones: evaluacionesPorCategoria[cat].evaluaciones
            }));

            //======DESEMPEÑO GENERAL, DATOS PUROS======
            const todasCalificaciones = calificaciones.map(c=> c.calificacion);
            const promedioGeneral = todasCalificaciones.length > 0
                ? (todasCalificaciones.reduce((a, b) => a + b, 0) / todasCalificaciones.length).toFixed(1)
                : null;
            const getNivelDesempeno = (prom) =>{
                if (prom === null) return null;
                const p = parseFloat(prom);
                if (p >= 4.5) return "Excelente";
                if (p >= 3.5) return "Bueno";
                if (p >= 2.5) return "Regular";
                return "Necesita Mejorar";
            };

            //======RESPUESTA========
            const resultado = {
                proyecto: proyecto,
                informacionPersonal: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    rut: usuario.rut,
                    email: usuario.email,
                    numero: usuario.numero || null,
                    fecha_ingreso: usuario.fecha_ingreso,
                    rol: usuario.rol,
                    activo: usuario.activo

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
                        ultimas: evaluacionesFiltradas.slice(0, 5).map(e => ({
                            id_evaluacion: e.id_evaluacion,
                            tarea: e.tarea?.actividad?.descripcion_esp || "Sin descripción",
                            cumplio: e.cumplio,
                            calificacion: e.calificacion,
                            comentario: e.comentario,
                            fecha: e.fecha_evaluacion,
                            evaluador: e.evaluador?.nombre || "Desconocido"
                        }))
                    }
                },
                desempenoGeneral:{
                    promedio: promedioGeneral,
                    nivel: getNivelDesempeno(promedioGeneral),
                    totalCalificaciones: todasCalificaciones.length
                },
                resumen: {
                    totalTareas: tareas.length,
                    totalAsistencias: asistencias.length,
                    totalEvaluaciones: evaluacionesFiltradas.length,
                    tasaAsistencia: asistencias.length > 0
                    ? Math.round((asistencias.filter(a => a.estado === "ASISTIDO").length / asistencias.length) * 100)
                    : null
                }
            };

            return [resultado, null];

        } catch (error){
            console.error("error en obtener hoja de vida por proyecto service: ", error);
            return [null, error.message];
        }
    }
}