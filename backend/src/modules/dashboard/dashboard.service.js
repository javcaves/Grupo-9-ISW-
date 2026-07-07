import { AppDataSource } from '../../config/ConfigDB.js';

const proyectoRepository           = AppDataSource.getRepository('Proyecto');
const usuarioRepository            = AppDataSource.getRepository('Usuario');
const asistenciaEmpleadoRepository = AppDataSource.getRepository('AsistenciaEmpleado');
const programarTareaRepository     = AppDataSource.getRepository('ProgramarTarea');
const itemProyectoRepository       = AppDataSource.getRepository('ItemProyecto');
const movimientoRepository        = AppDataSource.getRepository('MovimientoInventario');

// Estados de AsistenciaEmpleado que cuentan como "asistió"
const ESTADOS_ASISTIO = ['PRESENTE', 'ATRASO'];
// Estados de ProgramarTarea que cuentan como "finalizada"
const ESTADO_TAREA_FINALIZADA = 'FINALIZADA';
// Estados de ProgramarTarea que NO cuentan como vencida aunque su fecha ya pasó
const ESTADOS_TAREA_CERRADA = ['FINALIZADA', 'CANCELADA'];

/**
 * Devuelve el rango de fechas [desde, hasta] en formato 'YYYY-MM-DD'
 * para los últimos `dias` días, incluyendo hoy.
 */
const obtenerRangoFechas = (dias = 30) => {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(desde.getDate() - (dias - 1));

    const aISO = (fecha) => fecha.toISOString().split('T')[0];
    return { desde: aISO(desde), hasta: aISO(hasta) };
};

/**
 * 1. KPIs generales
 */
export const obtenerKPIs = async (filtros = {}) => {
    try {
        const { dias = 30, id_proyecto } = filtros;
        const { desde, hasta } = obtenerRangoFechas(dias);

        // --- Proyectos activos ---
        const proyectosActivos = await proyectoRepository.count({
            where: { activo: true },
        });

        // --- Empleados activos ---
        const empleados = await usuarioRepository.count({
            where: { rol: 'EMPLEADO', activo: true },
        });

        // --- % Asistencia ---
        let qbAsistencia = asistenciaEmpleadoRepository
            .createQueryBuilder('ae')
            .innerJoin('ae.asistencia', 'a')
            .where('a.fecha BETWEEN :desde AND :hasta', { desde, hasta })
            .andWhere('ae.activo = true');

        if (id_proyecto) {
            qbAsistencia = qbAsistencia.andWhere('a.id_proyecto = :id_proyecto', { id_proyecto });
        }

        const totalRegistrosAsistencia = await qbAsistencia.getCount();
        const asistieron = await qbAsistencia
            .clone()
            .andWhere('ae.estado IN (:...estados)', { estados: ESTADOS_ASISTIO })
            .getCount();

        const porcentajeAsistencia = totalRegistrosAsistencia > 0
            ? Number(((asistieron / totalRegistrosAsistencia) * 100).toFixed(1))
            : 0;

        // --- % Tareas ---
        let qbTareas = programarTareaRepository
            .createQueryBuilder('pt')
            .innerJoin('pt.actividad', 'act')
            .where('pt.fecha BETWEEN :desde AND :hasta', { desde, hasta });

        if (id_proyecto) {
            qbTareas = qbTareas.andWhere('act.id_proyecto = :id_proyecto', { id_proyecto });
        }

        const totalTareas = await qbTareas.getCount();
        const tareasFinalizadas = await qbTareas
            .clone()
            .andWhere('pt.estado = :estado', { estado: ESTADO_TAREA_FINALIZADA })
            .getCount();

        const porcentajeTareas = totalTareas > 0
            ? Number(((tareasFinalizadas / totalTareas) * 100).toFixed(1))
            : 0;

        // --- Stock bajo ---
        let qbStock = itemProyectoRepository
            .createQueryBuilder('ip')
            .where('ip.activo = true')
            .andWhere('ip.cantidad <= ip.stock_minimo');

        if (id_proyecto) {
            qbStock = qbStock.andWhere('ip.id_proyecto = :id_proyecto', { id_proyecto });
        }

        const stockBajo = await qbStock.getCount();

        // --- Alertas (reutiliza la lógica de obtenerAlertas) ---
        const [alertas, errAlertas] = await obtenerAlertas(filtros);
        const totalAlertas = errAlertas ? 0 : alertas.length;

        return [{
            proyectosActivos,
            empleados,
            porcentajeAsistencia,
            porcentajeTareas,
            stockBajo,
            alertas: totalAlertas,
        }, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * 2. Serie de asistencia diaria (para el gráfico de líneas)
 */
export const obtenerAsistenciaSerie = async (filtros = {}) => {
    try {
        const { dias = 30, id_proyecto } = filtros;
        const { desde, hasta } = obtenerRangoFechas(dias);

        let qb = asistenciaEmpleadoRepository
            .createQueryBuilder('ae')
            .innerJoin('ae.asistencia', 'a')
            .select('a.fecha', 'fecha')
            .addSelect('COUNT(*)', 'total')
            .addSelect(
                `COUNT(*) FILTER (WHERE ae.estado IN ('PRESENTE', 'ATRASO'))`,
                'asistieron'
            )
            .where('a.fecha BETWEEN :desde AND :hasta', { desde, hasta })
            .andWhere('ae.activo = true')
            .groupBy('a.fecha')
            .orderBy('a.fecha', 'ASC');

        if (id_proyecto) {
            qb = qb.andWhere('a.id_proyecto = :id_proyecto', { id_proyecto });
        }

        const filas = await qb.getRawMany();

        const serie = filas.map((f) => ({
            fecha: f.fecha,
            porcentaje: f.total > 0
                ? Number(((Number(f.asistieron) / Number(f.total)) * 100).toFixed(1))
                : 0,
        }));

        return [serie, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * 3. Estado de proyectos (para el gráfico de dona)
 */
export const obtenerEstadoProyectos = async (filtros = {}) => {
    try {
        const { id_proyecto } = filtros;

        let qb = proyectoRepository
            .createQueryBuilder('p')
            .select('p.estado', 'estado')
            .addSelect('COUNT(*)', 'cantidad')
            .where('p.activo = true')
            .groupBy('p.estado');

        if (id_proyecto) {
            qb = qb.andWhere('p.id_proyecto = :id_proyecto', { id_proyecto });
        }

        const filas = await qb.getRawMany();

        const resultado = filas.map((f) => ({
            estado: f.estado,
            cantidad: Number(f.cantidad),
        }));

        return [resultado, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * 4. Rendimiento por proyecto: % asistencia + % tareas, uno por proyecto
 *    (para el gráfico de barras horizontales)
 */
export const obtenerRendimientoPorProyecto = async (filtros = {}) => {
    try {
        const { dias = 30 } = filtros;
        const { desde, hasta } = obtenerRangoFechas(dias);

        const proyectos = await proyectoRepository.find({
            where: { activo: true },
            order: { id_proyecto: 'ASC' },
        });

        if (proyectos.length === 0) return [[], null];

        // Asistencia agrupada por proyecto
        const asistenciaPorProyecto = await asistenciaEmpleadoRepository
            .createQueryBuilder('ae')
            .innerJoin('ae.asistencia', 'a')
            .select('a.id_proyecto', 'id_proyecto')
            .addSelect('COUNT(*)', 'total')
            .addSelect(
                `COUNT(*) FILTER (WHERE ae.estado IN ('PRESENTE', 'ATRASO'))`,
                'asistieron'
            )
            .where('a.fecha BETWEEN :desde AND :hasta', { desde, hasta })
            .andWhere('ae.activo = true')
            .groupBy('a.id_proyecto')
            .getRawMany();

        // Tareas agrupadas por proyecto
        const tareasPorProyecto = await programarTareaRepository
            .createQueryBuilder('pt')
            .innerJoin('pt.actividad', 'act')
            .select('act.id_proyecto', 'id_proyecto')
            .addSelect('COUNT(*)', 'total')
            .addSelect(
                `COUNT(*) FILTER (WHERE pt.estado = 'FINALIZADA')`,
                'finalizadas'
            )
            .where('pt.fecha BETWEEN :desde AND :hasta', { desde, hasta })
            .groupBy('act.id_proyecto')
            .getRawMany();

        const mapaAsistencia = new Map(
            asistenciaPorProyecto.map((f) => [
                f.id_proyecto,
                Number(f.total) > 0 ? (Number(f.asistieron) / Number(f.total)) * 100 : 0,
            ])
        );
        const mapaTareas = new Map(
            tareasPorProyecto.map((f) => [
                f.id_proyecto,
                Number(f.total) > 0 ? (Number(f.finalizadas) / Number(f.total)) * 100 : 0,
            ])
        );

        const resultado = proyectos.map((p) => ({
            id_proyecto: p.id_proyecto,
            nombre_proy: p.nombre_proy,
            porcentajeAsistencia: Number((mapaAsistencia.get(p.id_proyecto) ?? 0).toFixed(1)),
            porcentajeTareas: Number((mapaTareas.get(p.id_proyecto) ?? 0).toFixed(1)),
        }));

        return [resultado, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * 5. Inventario: stock crítico, solicitudes pendientes, consumo mensual
 */
export const obtenerInventario = async (filtros = {}) => {
    try {
        const { id_proyecto } = filtros;

        // Stock crítico
        let qbStock = itemProyectoRepository
            .createQueryBuilder('ip')
            .leftJoinAndSelect('ip.item', 'item')
            .where('ip.activo = true')
            .andWhere('ip.cantidad <= ip.stock_minimo');

        if (id_proyecto) {
            qbStock = qbStock.andWhere('ip.id_proyecto = :id_proyecto', { id_proyecto });
        }

        const stockCriticoRaw = await qbStock.getMany();
        const stockCritico = stockCriticoRaw.map((ip) => ({
            id_proyecto: ip.id_proyecto,
            id_item: ip.id_item,
            nombre: ip.item?.nombre,
            cantidad: ip.cantidad,
            stock_minimo: ip.stock_minimo,
        }));

        // Solicitudes pendientes
        let qbSolicitudes = movimientoRepository
            .createQueryBuilder('mi')
            .where('mi.estado_solicitud = :estado', { estado: 'PENDIENTE' });

        if (id_proyecto) {
            qbSolicitudes = qbSolicitudes.andWhere('mi.id_proyecto = :id_proyecto', { id_proyecto });
        }

        const solicitudesPendientes = await qbSolicitudes.getCount();

        // Consumo mensual (últimos 6 meses, tipo_movimiento = SALIDA)
        const seisAtras = new Date();
        seisAtras.setMonth(seisAtras.getMonth() - 5);
        seisAtras.setDate(1);

        let qbConsumo = movimientoRepository
            .createQueryBuilder('mi')
            .select(`TO_CHAR(mi.fecha, 'YYYY-MM')`, 'mes')
            .addSelect('SUM(mi.cantidad)', 'total')
            .where('mi.tipo_movimiento = :tipo', { tipo: 'SALIDA' })
            .andWhere('mi.fecha >= :desde', { desde: seisAtras.toISOString() })
            .groupBy(`TO_CHAR(mi.fecha, 'YYYY-MM')`)
            .orderBy('mes', 'ASC');

        if (id_proyecto) {
            qbConsumo = qbConsumo.andWhere('mi.id_proyecto = :id_proyecto', { id_proyecto });
        }

        const consumoRaw = await qbConsumo.getRawMany();
        const consumoMensual = consumoRaw.map((f) => ({
            mes: f.mes,
            total: Number(f.total),
        }));

        return [{ stockCritico, solicitudesPendientes, consumoMensual }, null];
    } catch (error) {
        return [null, error.message];
    }
};

/**
 * 6. Alertas: reglas de negocio calculadas al vuelo (no hay tabla propia)
 */
export const obtenerAlertas = async (filtros = {}) => {
    try {
        const { dias = 30, id_proyecto } = filtros;
        const { desde, hasta } = obtenerRangoFechas(dias);

        const alertas = [];

        const proyectos = await proyectoRepository.find({
            where: id_proyecto
                ? { activo: true, id_proyecto }
                : { activo: true },
        });

        if (proyectos.length === 0) return [[], null];

        const idsProyectos = proyectos.map((p) => p.id_proyecto);
        const mapaNombres = new Map(proyectos.map((p) => [p.id_proyecto, p.nombre_proy]));

        // --- Asistencia baja (< 80%) por proyecto ---
        const asistenciaPorProyecto = await asistenciaEmpleadoRepository
            .createQueryBuilder('ae')
            .innerJoin('ae.asistencia', 'a')
            .select('a.id_proyecto', 'id_proyecto')
            .addSelect('COUNT(*)', 'total')
            .addSelect(
                `COUNT(*) FILTER (WHERE ae.estado IN ('PRESENTE', 'ATRASO'))`,
                'asistieron'
            )
            .where('a.fecha BETWEEN :desde AND :hasta', { desde, hasta })
            .andWhere('ae.activo = true')
            .andWhere('a.id_proyecto IN (:...ids)', { ids: idsProyectos })
            .groupBy('a.id_proyecto')
            .getRawMany();

        for (const fila of asistenciaPorProyecto) {
            const total = Number(fila.total);
            const asistieron = Number(fila.asistieron);
            const porcentaje = total > 0 ? (asistieron / total) * 100 : 0;

            if (porcentaje < 80) {
                alertas.push({
                    severidad: 'ROJO',
                    id_proyecto: fila.id_proyecto,
                    mensaje: `Proyecto ${mapaNombres.get(fila.id_proyecto)} tiene asistencia inferior al 80% (${porcentaje.toFixed(1)}%)`,
                });
            }
        }

        // --- Tareas vencidas por proyecto ---
        const hoy = new Date().toISOString().split('T')[0];

        const tareasVencidasPorProyecto = await programarTareaRepository
            .createQueryBuilder('pt')
            .innerJoin('pt.actividad', 'act')
            .select('act.id_proyecto', 'id_proyecto')
            .addSelect('COUNT(*)', 'vencidas')
            .where('pt.fecha < :hoy', { hoy })
            .andWhere('pt.estado NOT IN (:...cerrados)', { cerrados: ESTADOS_TAREA_CERRADA })
            .andWhere('act.id_proyecto IN (:...ids)', { ids: idsProyectos })
            .groupBy('act.id_proyecto')
            .getRawMany();

        for (const fila of tareasVencidasPorProyecto) {
            const vencidas = Number(fila.vencidas);
            if (vencidas > 0) {
                alertas.push({
                    severidad: 'AMARILLO',
                    id_proyecto: fila.id_proyecto,
                    mensaje: `Proyecto ${mapaNombres.get(fila.id_proyecto)} posee ${vencidas} tarea(s) vencida(s)`,
                });
            }
        }

        // --- Stock crítico por proyecto ---
        const stockCriticoPorProyecto = await itemProyectoRepository
            .createQueryBuilder('ip')
            .select('ip.id_proyecto', 'id_proyecto')
            .addSelect('COUNT(*)', 'items_criticos')
            .where('ip.activo = true')
            .andWhere('ip.cantidad <= ip.stock_minimo')
            .andWhere('ip.id_proyecto IN (:...ids)', { ids: idsProyectos })
            .groupBy('ip.id_proyecto')
            .getRawMany();

        for (const fila of stockCriticoPorProyecto) {
            const criticos = Number(fila.items_criticos);
            if (criticos > 0) {
                alertas.push({
                    severidad: 'ROJO',
                    id_proyecto: fila.id_proyecto,
                    mensaje: `Proyecto ${mapaNombres.get(fila.id_proyecto)} tiene stock crítico (${criticos} ítem(s))`,
                });
            }
        }

        // --- Proyectos con 100% de tareas completadas (alerta positiva) ---
        const tareasPorProyecto = await programarTareaRepository
            .createQueryBuilder('pt')
            .innerJoin('pt.actividad', 'act')
            .select('act.id_proyecto', 'id_proyecto')
            .addSelect('COUNT(*)', 'total')
            .addSelect(`COUNT(*) FILTER (WHERE pt.estado = 'FINALIZADA')`, 'finalizadas')
            .where('pt.fecha BETWEEN :desde AND :hasta', { desde, hasta })
            .andWhere('act.id_proyecto IN (:...ids)', { ids: idsProyectos })
            .groupBy('act.id_proyecto')
            .getRawMany();

        for (const fila of tareasPorProyecto) {
            const total = Number(fila.total);
            const finalizadas = Number(fila.finalizadas);
            if (total > 0 && total === finalizadas) {
                alertas.push({
                    severidad: 'VERDE',
                    id_proyecto: fila.id_proyecto,
                    mensaje: `Proyecto ${mapaNombres.get(fila.id_proyecto)} completó el 100% de sus tareas`,
                });
            }
        }

        return [alertas, null];
    } catch (error) {
        return [null, error.message];
    }
};
