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
import { ItemProyecto } from '../../entity/item_proyecto.entity.js';
import { MovimientoInventario } from '../../entity/movimientoInventario.entity.js';

const itemRepo = () => AppDataSource.getRepository(Item);
const itemProyectoRepo = () => AppDataSource.getRepository(ItemProyecto);
const movRepo  = () => AppDataSource.getRepository(MovimientoInventario);

const TIPOS_QUE_SUMAN  = ['ENTRADA', 'ABASTECIMIENTO', 'COMPRA'];
const TIPOS_QUE_RESTAN = ['SALIDA'];

// ================= ITEMS CORE =================
export const crearItem = async (data) => {
    const repo = itemRepo();
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
    const repoItemProj = itemProyectoRepo();
    const repoMov = movRepo();

    // 1. Manejo Especial si es una SOLICITUD
    if (data.tipo_movimiento === 'SOLICITUD') {
        let itemRel = null;
        if (data.id_item) {
            itemRel = await itemRepo().findOne({ where: { id_item: data.id_item, activo: true } });
            if (!itemRel) return [null, 'Item asociado no encontrado o inactivo.'];
        } else if (!data.item_sugerido) {
            return [null, 'Debe indicar un item existente o proponer el nombre de uno nuevo.'];
        }

        const movimiento = repoMov.create({
            item: itemRel,
            item_sugerido: data.item_sugerido || null,
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
    const item = await itemRepo().findOne({ where: { id_item: data.id_item, activo: true } });
    if (!item) return [null, 'Item no encontrado o inactivo.'];

    let itemProj = await repoItemProj.findOne({ where: { id_proyecto: data.id_proyecto, id_item: data.id_item } });
    if (!itemProj) {
        itemProj = repoItemProj.create({ id_proyecto: data.id_proyecto, id_item: data.id_item, cantidad: 0, stock_minimo: 0, activo: true });
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
};

// ================= RESOLVER SOLICITUD =================
export const resolverSolicitud = async (id_mov, dataResolucion) => {
    const repoMov = movRepo();
    const repoItem = itemRepo();
    const repoItemProj = itemProyectoRepo();

    const mov = await repoMov.findOne({ where: { id_mov } });
    if (!mov) return [null, 'Movimiento no encontrado.'];
    if (mov.tipo_movimiento !== 'SOLICITUD') return [null, 'Este movimiento no es una solicitud.'];
    if (mov.estado_solicitud !== 'PENDIENTE') return [null, 'La solicitud ya fue resuelta.'];

    if (dataResolucion.decision === 'APROBADO') {
        let itemFinal = mov.item;

        // Si la solicitud era de un ítem no registrado, el Supervisor lo crea aquí
        if (!itemFinal) {
            if (!dataResolucion.nombre || !dataResolucion.tipo || !dataResolucion.unidad_medida || !dataResolucion.control) {
                return [null, 'Para aprobar un item no registrado debe proveer los datos de creación completos.'];
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

        let itemProj = await repoItemProj.findOne({ where: { id_proyecto: mov.id_proyecto, id_item: itemFinal.id_item } });
        if (!itemProj) {
            itemProj = repoItemProj.create({ id_proyecto: mov.id_proyecto, id_item: itemFinal.id_item, cantidad: 0, stock_minimo: 0, activo: true });
        }

        if (itemProj.cantidad < mov.cantidad) {
            return [null, `Stock insuficiente en el proyecto para autorizar la solicitud. Disponible: ${itemProj.cantidad}.`];
        }

        itemProj.cantidad -= mov.cantidad;
        await repoItemProj.save(itemProj);
    }

    mov.estado_solicitud = dataResolucion.decision;
    const actualizado = await repoMov.save(mov);
    return [actualizado, null];
};

// ================= ACTUALIZAR INVENTARIO  =================
export const actualizarInventarioAuditoria = async (id_proyecto, id_emisor, itemsAuditados) => {
    const repoItemProj = itemProyectoRepo();
    const repoMov = movRepo();
    const ahora = new Date();

    for (const audit of itemsAuditados) {
        let itemProj = await repoItemProj.findOne({ where: { id_proyecto, id_item: audit.id_item } });
        if (!itemProj) {
            itemProj = repoItemProj.create({ id_proyecto, id_item: audit.id_item, cantidad: 0, stock_minimo: audit.stock_minimo, activo: true });
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
        itemProj.stock_minimo = audit.stock_minimo;
        itemProj.ultima_revision = ahora;
        await repoItemProj.save(itemProj);
    }

    return [{ message: 'Inventario auditado y actualizado correctamente.' }, null];
};

// ================= ELIMINAR MOVIMIENTO (RESTRICCIÓN 1 SEMANA) =================
export const eliminarMovimiento = async (id_mov) => {
    const repoMov = movRepo();
    const repoItemProj = itemProyectoRepo();

    const mov = await repoMov.findOne({ where: { id_mov }, relations: ['item'] });
    if (!mov) return [null, 'Movimiento no encontrado.'];

    const unaSemanaMs = 7 * 24 * 60 * 60 * 1000;
    if ((new Date() - new Date(mov.fecha)) > unaSemanaMs) {
        return [null, 'No se pueden eliminar movimientos de inventario fuera de la semana de creación.'];
    }

    // Revertir el impacto en el stock si el movimiento no era una solicitud pendiente
    if (mov.tipo_movimiento !== 'SOLICITUD' || mov.estado_solicitud === 'APROBADO') {
        const itemProj = await repoItemProj.findOne({ where: { id_proyecto: mov.id_proyecto, id_item: mov.item.id_item } });
        if (itemProj) {
            if (TIPOS_QUE_SUMAN.includes(mov.tipo_movimiento)) {
                itemProj.cantidad -= mov.cantidad;
            } else {
                itemProj.cantidad += mov.cantidad;
            }
            await repoItemProj.save(itemProj);
        }
    }

    await repoMov.delete(id_mov);
    return [{ message: 'Movimiento eliminado y stock restaurado.' }, null];
};

// ================= LECTURAS ADICIONALES =================
export const obtenerMovimientos = async () => {
    return await movRepo().find({ order: { fecha: 'DESC' } });
};

export const obtenerSolicitudesPendientes = async () => {
    return await movRepo().find({ where: { tipo_movimiento: 'SOLICITUD', estado_solicitud: 'PENDIENTE' }, order: { fecha: 'ASC' } });
};

export const obtenerMovimientosPorItem = async (id_item) => {
    return await movRepo().find({ where: { item: { id_item } }, order: { fecha: 'DESC' } });
};

export const obtenerBajoStockPorProyecto = async (id_proyecto) => {
    return await itemProyectoRepo()
        .createQueryBuilder('ip')
        .innerJoinAndSelect('ip.item', 'item')
        .where('ip.id_proyecto = :id_proyecto', { id_proyecto })
        .andWhere('ip.activo = true')
        .andWhere('ip.cantidad <= ip.stock_minimo')
        .getMany();
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
