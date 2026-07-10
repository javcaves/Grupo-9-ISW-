/**
 * @file items.service.js
 * @description Lógica para el módulo de items de bodega y movimientos de inventario
 */

/**
 * @typedef {Object} Item
 * @property {number} id -identificador
 * @property {string} nombre -Nombre de item
 * @property {number} id_tipo
 * @property {number} stock_minimo -alerta si falta stock
 * @property {string} unidad_medida - bidon, caja etc
 * @property {boolean} activo -Soft delete
 */

import { AppDataSource } from '../../config/ConfigDB.js';
import { Item } from '../../entity/item.entity.js';
import { ItemProyecto } from '../../entity/itemProyecto.entity.js';
import { MovimientoInventario } from '../../entity/movimientoInventario.entity.js';
import * as NotificacionService from '../notificaciones/notificacion.service.js';

const itemRepo = () => AppDataSource.getRepository(Item);
const itemProyectoRepo = () => AppDataSource.getRepository(ItemProyecto);
const movRepo = () => AppDataSource.getRepository(MovimientoInventario);

// Aplana una fila ItemProyecto (+ su relación item) al shape plano que
// consume el frontend: atributos propios del Item (nombre, tipo,
// unidad_medida, control) junto a los campos que viven en el vínculo
// ItemProyecto (cantidad, stock_minimo, ultima_revision, activo).
const mapItemProyectoDTO = (ip) => ({
    id_item: ip.id_item,
    id_proyecto: ip.id_proyecto,
    nombre: ip.item?.nombre,
    descripcion: ip.item?.descripcion,
    tipo: ip.item?.tipo,
    unidad_medida: ip.item?.unidad_medida,
    control: ip.item?.control,
    cantidad_actual: ip.cantidad,
    stock_minimo: ip.stock_minimo,
    ultima_revision: ip.ultima_revision,
    activo: ip.activo,
});

const TIPOS_QUE_SUMAN = ['ENTRADA', 'ABASTECIMIENTO', 'COMPRA'];
const TIPOS_QUE_RESTAN = ['SALIDA'];

// ID de proyecto que representa la Bodega Central / Matriz.
// Toda SOLICITUD aprobada sale de aquí y entra al proyecto destino.
const ID_BODEGA_CENTRAL = 1;

// Enums válidos, espejo de las entidades (para dar mensajes de error propios
// en vez de dejar que TypeORM/Postgres tire el error genérico)
const TIPOS_ITEM_VALIDOS = ['MAQUINARIA', 'HERRAMIENTA', 'UTENSILIO', 'PRODUCTO'];
const UNIDADES_VALIDAS = ['LITROS', 'UNIDADES', 'KILOS', 'SACOS', 'BOLSAS', 'METROS'];
const CONTROL_VALIDOS = ['CONSUMO', 'PRESTAMO'];
const TIPOS_MOVIMIENTO_VALIDOS = ['ENTRADA', 'SALIDA', 'SOLICITUD', 'ABASTECIMIENTO', 'COMPRA'];

// ================= HELPERS =================
const validarCantidadPositiva = (cantidad) => {
    if (typeof cantidad !== 'number' || !Number.isFinite(cantidad) || cantidad <= 0) {
        return 'La cantidad debe ser un número mayor a 0.';
    }
    return null;
};

const validarDatosItem = (data, { parcial = false } = {}) => {
    if (!parcial || data.tipo !== undefined) {
        if (!TIPOS_ITEM_VALIDOS.includes(data.tipo)) {
            return `Tipo de item inválido. Valores permitidos: ${TIPOS_ITEM_VALIDOS.join(', ')}.`;
        }
    }
    if (!parcial || data.unidad_medida !== undefined) {
        if (!UNIDADES_VALIDAS.includes(data.unidad_medida)) {
            return `Unidad de medida inválida. Valores permitidos: ${UNIDADES_VALIDAS.join(', ')}.`;
        }
    }
    if (!parcial || data.control !== undefined) {
        if (!CONTROL_VALIDOS.includes(data.control)) {
            return `Control inválido. Valores permitidos: ${CONTROL_VALIDOS.join(', ')}.`;
        }
    }
    return null;
};

// ================= ITEMS CORE =================
export const crearItem = async (data) => {
    const repo = itemRepo();

    const errorEnum = validarDatosItem(data);
    if (errorEnum) return [null, errorEnum];

    const existe = await repo.findOne({ where: { nombre: data.nombre } });
    if (existe) return [null, 'Ya existe un item con ese nombre.'];

    const nuevo = repo.create({ ...data, activo: true });
    const guardado = await repo.save(nuevo);
    return [guardado, null];
};

export const obtenerTodos = async () => {
    return await itemRepo().find({ order: { nombre: 'ASC' } });
};

export const obtenerActivos = async () => {
    return await itemRepo().find({ where: { activo: true }, order: { nombre: 'ASC' } });
};

export const obtenerPorId = async (id) => {
    const item = await itemRepo().findOne({ where: { id_item: id } });
    if (!item) return [null, 'Item no encontrado.'];
    return [item, null];
};

export const actualizarItem = async (id, data) => {
    const repo = itemRepo();
    const item = await repo.findOne({ where: { id_item: id } });
    if (!item) return [null, 'Item no encontrado.'];

    const errorEnum = validarDatosItem(data, { parcial: true });
    if (errorEnum) return [null, errorEnum];

    if (data.nombre && data.nombre !== item.nombre) {
        const existe = await repo.findOne({ where: { nombre: data.nombre } });
        if (existe) return [null, 'El nuevo nombre ya esta en uso.'];
        item.nombre = data.nombre;
    }

    if (data.descripcion !== undefined) item.descripcion = data.descripcion;
    if (data.tipo !== undefined) item.tipo = data.tipo;
    if (data.unidad_medida !== undefined) item.unidad_medida = data.unidad_medida;
    if (data.control !== undefined) item.control = data.control;

    const actualizado = await repo.save(item);
    return [actualizado, null];
};

export const desactivarItem = async (id) => {
    const item = await itemRepo().findOne({ where: { id_item: id } });
    if (!item) return [null, 'Item no encontrado.'];
    if (!item.activo) return [null, 'El item ya estaba desactivado.'];

    await itemRepo().update(id, { activo: false });
    return [{ message: 'Item eliminado (soft delete)' }, null];
};

// ================= MOVIMIENTOS REGISTRAR =================
export const registrarMovimiento = async (data) => {
    if (!TIPOS_MOVIMIENTO_VALIDOS.includes(data.tipo_movimiento)) {
        return [null, `Tipo de movimiento inválido. Valores permitidos: ${TIPOS_MOVIMIENTO_VALIDOS.join(', ')}.`];
    }

    const errorCantidad = validarCantidadPositiva(data.cantidad);
    if (errorCantidad) return [null, errorCantidad];

    let resultado;
    try {
        resultado = await AppDataSource.transaction(async (manager) => {
            const repoItem = manager.getRepository(Item);
            const repoItemProj = manager.getRepository(ItemProyecto);
            const repoMov = manager.getRepository(MovimientoInventario);

            // 1. Manejo Especial si es una SOLICITUD
            if (data.tipo_movimiento === 'SOLICITUD') {
                let itemRel = null;
                if (data.id_item) {
                    itemRel = await repoItem.findOne({ where: { id_item: data.id_item, activo: true } });
                    if (!itemRel) return [null, 'Item asociado no encontrado o inactivo.'];
                } else if (!data.item_sugerido) {
                    return [null, 'Debe indicar un item existente o proponer el nombre de uno nuevo.'];
                }

                const movimiento = repoMov.create({
                    item: itemRel,
                    item_sugerido: data.item_sugerido || null,
                    tipo: data.tipo || null,
                    unidad_medida: data.unidad_medida || null,
                    control: data.control || null,
                    id_proyecto: data.id_proyecto,
                    id_emisor: data.id_emisor,
                    id_receptor: data.id_receptor || null,
                    tipo_movimiento: 'SOLICITUD',
                    cantidad: data.cantidad,
                    descripcion: data.descripcion || '',
                    estado_solicitud: 'PENDIENTE'
                });

                const guardado = await repoMov.save(movimiento);
                return [guardado, null];
            }

            // 2. Manejo de Movimientos Regulares (Requieren Item existente)
            if (!data.id_item) return [null, 'El id_item es requerido para este movimiento.'];
            const item = await repoItem.findOne({ where: { id_item: data.id_item, activo: true } });
            if (!item) return [null, 'Item no encontrado o inactivo.'];

            let itemProj = await repoItemProj.findOne({ where: { id_proyecto: data.id_proyecto, id_item: data.id_item } });
            if (!itemProj) {
                itemProj = repoItemProj.create({ id_proyecto: data.id_proyecto, id_item: data.id_item, cantidad: 0, stock_minimo: 0, activo: true });
            }
            if (!itemProj.activo) {
                return [null, 'El registro de inventario de este item en este proyecto está inactivo.'];
            }

            if (TIPOS_QUE_RESTAN.includes(data.tipo_movimiento)) {
                if (itemProj.cantidad < data.cantidad) {
                    return [null, `Stock insuficiente en este proyecto. Disponible: ${itemProj.cantidad} ${item.unidad_medida}.`];
                }
            }

            const movimiento = repoMov.create({
                item,
                id_proyecto: data.id_proyecto,
                id_emisor: data.id_emisor,
                id_receptor: data.id_receptor || null,
                tipo_movimiento: data.tipo_movimiento,
                cantidad: data.cantidad,
                descripcion: data.descripcion || '',
                estado_solicitud: null
            });

            const guardado = await repoMov.save(movimiento);

            if (TIPOS_QUE_SUMAN.includes(data.tipo_movimiento)) {
                itemProj.cantidad += data.cantidad;
            } else if (TIPOS_QUE_RESTAN.includes(data.tipo_movimiento)) {
                itemProj.cantidad -= data.cantidad;
            }
            await repoItemProj.save(itemProj);

            return [guardado, null];
        });
    } catch (error) {
        console.error('Error en registrarMovimiento:', error);
        return [null, 'Error interno al registrar el movimiento.'];
    }

    const [guardado, err] = resultado;
    if (!err && guardado?.tipo_movimiento === 'SOLICITUD') {
        const [, errNotif] = await NotificacionService.notificarSolicitudPendiente(guardado);
        if (errNotif) console.error('error al notificar solicitud pendiente:', errNotif);
    }

    return resultado;
};

// ================= RESOLVER SOLICITUD =================
export const resolverSolicitud = async (id_mov, dataResolucion) => {
    let resultado;
    try {
        resultado = await AppDataSource.transaction(async (manager) => {
            const repoMov = manager.getRepository(MovimientoInventario);
            const repoItem = manager.getRepository(Item);
            const repoItemProj = manager.getRepository(ItemProyecto);

            const mov = await repoMov.findOne({ where: { id_mov } });
            if (!mov) return [null, 'Movimiento no encontrado.'];
            if (mov.tipo_movimiento !== 'SOLICITUD') return [null, 'Este movimiento no es una solicitud.'];
            if (mov.estado_solicitud !== 'PENDIENTE') return [null, 'La solicitud ya fue resuelta.'];

            if (dataResolucion.decision === 'APROBADO') {
                let itemFinal = mov.item;

                // Si la solicitud era de un ítem no registrado, el Supervisor lo crea aquí
                if (!itemFinal) {
                    const errorEnum = validarDatosItem(dataResolucion);
                    if (!dataResolucion.nombre || errorEnum) {
                        return [null, errorEnum || 'Para aprobar un item no registrado debe proveer los datos de creación completos.'];
                    }
                    const existeNombre = await repoItem.findOne({ where: { nombre: dataResolucion.nombre } });
                    if (existeNombre) return [null, 'El nombre propuesto ya está en uso.'];

                    const nuevoItem = repoItem.create({
                        nombre: dataResolucion.nombre,
                        tipo: dataResolucion.tipo,
                        unidad_medida: dataResolucion.unidad_medida,
                        control: dataResolucion.control,
                        activo: true
                    });
                    itemFinal = await repoItem.save(nuevoItem);
                    mov.item = itemFinal;
                }

                mov.item = itemFinal;
            }

            mov.estado_solicitud = dataResolucion.decision;
            const actualizado = await repoMov.save(mov);
            return [actualizado, null];
        });
    } catch (error) {
        console.error('Error en resolverSolicitud:', error);
        return [null, 'Error interno al resolver la solicitud.'];
    }

    const [actualizado, err] = resultado;
    if (!err) {
        const [, errNotif] = await NotificacionService.notificarResolucionSolicitud(actualizado);
        if (errNotif) console.error('error al notificar resolucion de solicitud:', errNotif);
    
        // NUEVO: cierra la notificación original (la que vieron los aprobadores)
        const [, errResuelto] = await NotificacionService.marcarResueltasPorReferencia({
            tipo_referencia: 'MOVIMIENTO_INVENTARIO',
            id_referencia: actualizado.id_mov,
            tipo: 'SOLICITUD_PENDIENTE',
        });
        if (errResuelto) console.error('error al marcar notificacion de item como resuelta:', errResuelto);
    }

    return resultado;
};

// ================= ACTUALIZAR INVENTARIO =================
export const actualizarInventarioAuditoria = async (id_proyecto, id_emisor, itemsAuditados) => {
    try {
        return await AppDataSource.transaction(async (manager) => {
            const repoItemProj = manager.getRepository(ItemProyecto);
            const repoMov = manager.getRepository(MovimientoInventario);
            const ahora = new Date();

            for (const audit of itemsAuditados) {
                if (typeof audit.cantidad !== 'number' || audit.cantidad < 0) {
                    return [null, `Cantidad auditada inválida para el item ${audit.id_item}.`];
                }

                let itemProj = await repoItemProj.findOne({ where: { id_proyecto, id_item: audit.id_item } });
                if (!itemProj) {
                    itemProj = repoItemProj.create({ id_proyecto, id_item: audit.id_item, cantidad: 0, stock_minimo: audit.stock_minimo ?? 0, activo: true });
                }

                const diferencia = audit.cantidad - itemProj.cantidad;

                if (diferencia !== 0) {
                    const tipoMov = diferencia > 0 ? 'ENTRADA' : 'SALIDA';
                    const movAjuste = repoMov.create({
                        item: { id_item: audit.id_item },
                        id_proyecto,
                        id_emisor,
                        tipo_movimiento: tipoMov,
                        cantidad: Math.abs(diferencia),
                        descripcion: 'AJUSTE AUTOMÁTICO POR DISCREPANCIA EN AUDITORÍA',
                        estado_solicitud: null
                    });
                    await repoMov.save(movAjuste);
                }

                itemProj.cantidad = audit.cantidad;
                itemProj.stock_minimo = audit.stock_minimo ?? itemProj.stock_minimo;
                itemProj.ultima_revision = ahora;
                await repoItemProj.save(itemProj);
            }

            return [{ message: 'Inventario auditado y actualizado correctamente.' }, null];
        });
    } catch (error) {
        console.error('Error en actualizarInventarioAuditoria:', error);
        return [null, 'Error interno al auditar el inventario.'];
    }
};

// ================= ELIMINAR MOVIMIENTO (RESTRICCIÓN 1 SEMANA) =================
export const eliminarMovimiento = async (id_mov) => {
    try {
        return await AppDataSource.transaction(async (manager) => {
            const repoMov = manager.getRepository(MovimientoInventario);
            const repoItemProj = manager.getRepository(ItemProyecto);

            const mov = await repoMov.findOne({ where: { id_mov }, relations: { item: true } });
            if (!mov) return [null, 'Movimiento no encontrado.'];

            const unaSemanaMs = 7 * 24 * 60 * 60 * 1000;
            if ((new Date() - new Date(mov.fecha)) > unaSemanaMs) {
                return [null, 'No se pueden eliminar movimientos de inventario fuera de la semana de creación.'];
            }

            if (mov.tipo_movimiento === 'SOLICITUD') {
                // Solo revertir si fue aprobada (afectó stock); si sigue pendiente o fue rechazada, no tocó nada.
                if (mov.estado_solicitud === 'APROBADO' && mov.item) {
                    const bodega = await repoItemProj.findOne({ where: { id_proyecto: ID_BODEGA_CENTRAL, id_item: mov.item.id_item } });
                    const destino = await repoItemProj.findOne({ where: { id_proyecto: mov.id_proyecto, id_item: mov.item.id_item } });

                    if (destino && destino.cantidad < mov.cantidad) {
                        return [null, 'No se puede revertir: el proyecto destino ya no tiene suficiente stock de este item (probablemente ya fue consumido).'];
                    }

                    if (bodega) {
                        bodega.cantidad += mov.cantidad;
                        await repoItemProj.save(bodega);
                    }
                    if (destino) {
                        destino.cantidad -= mov.cantidad;
                        await repoItemProj.save(destino);
                    }
                }
            } else {
                // Movimiento directo (ENTRADA, SALIDA, ABASTECIMIENTO, COMPRA)
                const itemProj = await repoItemProj.findOne({ where: { id_proyecto: mov.id_proyecto, id_item: mov.item.id_item } });
                if (itemProj) {
                    if (TIPOS_QUE_SUMAN.includes(mov.tipo_movimiento)) {
                        if (itemProj.cantidad < mov.cantidad) {
                            return [null, 'No se puede revertir: el stock actual es menor a la cantidad del movimiento (probablemente ya fue consumido).'];
                        }
                        itemProj.cantidad -= mov.cantidad;
                    } else {
                        itemProj.cantidad += mov.cantidad;
                    }
                    await repoItemProj.save(itemProj);
                }
            }

            await repoMov.delete(id_mov);
            return [{ message: 'Movimiento eliminado y stock restaurado.' }, null];
        });
    } catch (error) {
        console.error('Error en eliminarMovimiento:', error);
        return [null, 'Error interno al eliminar el movimiento.'];
    }
};

// ================= LECTURAS ADICIONALES =================
export const obtenerMovimientos = async () => {
    return await movRepo().find({ order: { fecha: 'DESC' } });
};

export const obtenerSolicitudesPendientes = async () => {
    return await movRepo().find({
        where: { tipo_movimiento: 'SOLICITUD', estado_solicitud: 'PENDIENTE' },
        relations: { proyecto: true, emisor: true },
        order: { fecha: 'ASC' }
    });
};

export const obtenerMovimientosPorItem = async (id_item) => {
    return await movRepo().find({ where: { item: { id_item } }, order: { fecha: 'DESC' } });
};

export const obtenerPorProyecto = async (id_proyecto) => {
    const filas = await itemProyectoRepo()
        .createQueryBuilder('ip')
        .innerJoinAndSelect('ip.item', 'item')
        .where('ip.id_proyecto = :id_proyecto', { id_proyecto })
        .orderBy('item.nombre', 'ASC')
        .getMany();
    return filas.map(mapItemProyectoDTO);
};

export const obtenerBajoStockPorProyecto = async (id_proyecto) => {
    const filas = await itemProyectoRepo()
        .createQueryBuilder('ip')
        .innerJoinAndSelect('ip.item', 'item')
        .where('ip.id_proyecto = :id_proyecto', { id_proyecto })
        .andWhere('ip.activo = true')
        .andWhere('ip.cantidad <= ip.stock_minimo')
        .getMany();
    return filas.map(mapItemProyectoDTO);
};

// Bajo stock a través de TODOS los proyectos (para la vista de
// inventario global, donde no hay un único "stock" por item -- cada
// item puede estar vinculado a varios proyectos con cantidades y
// mínimos distintos).
export const obtenerBajoStockGlobal = async () => {
    const filas = await itemProyectoRepo()
        .createQueryBuilder('ip')
        .innerJoinAndSelect('ip.item', 'item')
        .innerJoinAndSelect('ip.proyecto', 'proyecto')
        .where('ip.activo = true')
        .andWhere('ip.cantidad <= ip.stock_minimo')
        .orderBy('item.nombre', 'ASC')
        .getMany();

    return filas.map((ip) => ({
        ...mapItemProyectoDTO(ip),
        proyecto: ip.proyecto ? { id_proyecto: ip.proyecto.id_proyecto, nombre_proy: ip.proyecto.nombre_proy } : null,
    }));
};

// ================= VINCULAR / DESVINCULAR ITEM-PROYECTO =================
// Vincula un item YA EXISTENTE del catálogo a un proyecto. Si el item
// tuvo un vínculo previo con ese proyecto y fue desvinculado, reactiva
// esa misma fila (la PK es id_item + id_proyecto, no se puede duplicar).
export const vincularItemAProyecto = async (data) => {
    const { id_item, id_proyecto, cantidad = 0, stock_minimo = 0 } = data;

    const item = await itemRepo().findOne({ where: { id_item, activo: true } });
    if (!item) return [null, 'Item no encontrado o inactivo.'];

    const repo = itemProyectoRepo();
    let itemProj = await repo.findOne({ where: { id_item, id_proyecto } });

    if (itemProj && itemProj.activo) {
        return [null, 'Este item ya está vinculado a este proyecto.'];
    }

    if (itemProj) {
        itemProj.activo = true;
        itemProj.cantidad = cantidad;
        itemProj.stock_minimo = stock_minimo;
    } else {
        itemProj = repo.create({ id_item, id_proyecto, cantidad, stock_minimo, activo: true });
    }

    const guardado = await repo.save(itemProj);
    return [guardado, null];
};

// Desvincula (soft) un item de un proyecto: marca activo=false en su
// fila ItemProyecto. No borra el item del catálogo ni la fila en sí.
export const desvincularItemDeProyecto = async (id_item, id_proyecto) => {
    const repo = itemProyectoRepo();
    const itemProj = await repo.findOne({ where: { id_item, id_proyecto } });
    if (!itemProj) return [null, 'Este item no está vinculado a este proyecto.'];
    if (!itemProj.activo) return [null, 'Este item ya estaba desvinculado de este proyecto.'];

    itemProj.activo = false;
    await repo.save(itemProj);
    return [{ message: 'Item desvinculado del proyecto.' }, null];
};

// ================= ESTADISTICAS ((VER)) =================
export const obtenerEstadisticasConsumo = async () => {
    return await movRepo()
        .createQueryBuilder('mov')
        .select('item.nombre', 'nombre')
        .addSelect('SUM(mov.cantidad)', 'total_consumido')
        .innerJoin('mov.item', 'item')
        .where('mov.tipo_movimiento = :tipo', { tipo: 'SALIDA' })
        .groupBy('item.id_item')
        .addGroupBy('item.nombre')
        .orderBy('total_consumido', 'DESC')
        .limit(5)
        .getRawMany();
};