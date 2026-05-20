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

//1. IMPORTS
import { AppDataSource } from '../../config/ConfigDB.js';

//2. HELPER FUNCTIONS
const itemRepo = () => AppDataSource.getRepository('Item');
const movRepo  = () => AppDataSource.getRepository('MovimientoInventario');
 
const TIPOS_QUE_SUMAN  = ['ENTRADA', 'ABASTECIMIENTO', 'COMPRA'];
const TIPOS_QUE_RESTAN = ['SALIDA'];
 
export const lanzarError = (mensaje, status) => {
    const error = new Error(mensaje);
    error.status = status;
    throw error;
};


//3.MAIN FUNCTIONS

// ######### ITEMS CREAR #########

export const crearItem = async (data) => {
    const repo = itemRepo();
 
    const existe = await repo.findOne({ where: { nombre: data.nombre } });
    if (existe) return [null, 'Ya existe un item con ese nombre.'];
 
    const nuevo = repo.create({
        nombre:        data.nombre,
        descripcion:   data.descripcion || '',
        tipo:          data.tipo,
        unidad_medida: data.unidad_medida,
        control:       data.control,
        stock_actual:  data.stock_actual ?? 0,
        stock_minimo:  data.stock_minimo,
        activo:        true
    });
 
    const guardado = await repo.save(nuevo);
    return [guardado, null];
};

// ######### ITEMS LEER #########
export const obtenerTodos = async () => {
    return await itemRepo().find({ order: { nombre: 'ASC' } });
};
 
export const obtenerActivos = async () => {
    return await itemRepo().find({
        where: { activo: true },
        order: { nombre: 'ASC' }
    });
};
 
export const obtenerPorId = async (id) => {
    const item = await itemRepo().findOne({ where: { id_item: id } });
    if (!item) return [null, 'Item no encontrado.'];
    return [item, null];
};
 
export const obtenerPorTipo = async (tipo) => {
    return await itemRepo().find({
        where: { tipo, activo: true },
        order: { nombre: 'ASC' }
    });
};
 
// alerta de stock para items con el stock_actual igual o menor al stock_minimo
export const obtenerBajoStock = async () => {
    return await AppDataSource
        .getRepository('Item')
        .createQueryBuilder('item')
        .where('item.activo = true')
        .andWhere('item.stock_actual <= item.stock_minimo')
        .orderBy('item.stock_actual', 'ASC')
        .getMany();
};


// ######### ITEMS UPDATE #########
export const actualizarItem = async (id, data) => {
    const repo = itemRepo();
 
    const item = await repo.findOne({ where: { id_item: id } });
    if (!item) return [null, 'Item no encontrado.'];
 
    // Si cambia el nombre verificar que no este en uso
    if (data.nombre && data.nombre !== item.nombre) {
        const existe = await repo.findOne({ where: { nombre: data.nombre } });
        if (existe) return [null, 'El nuevo nombre ya esta en uso.'];
        item.nombre = data.nombre;
    }
 
    if (data.descripcion   !== undefined) item.descripcion   = data.descripcion;
    if (data.tipo          !== undefined) item.tipo          = data.tipo;
    if (data.unidad_medida !== undefined) item.unidad_medida = data.unidad_medida;
    if (data.control       !== undefined) item.control       = data.control;
    if (data.stock_minimo  !== undefined) item.stock_minimo  = data.stock_minimo;
 
    const actualizado = await repo.save(item);
    return [actualizado, null];
};

// ######### ITEMS ELIMINAR #########
export const desactivarItem = async (id) => {
    const item = await itemRepo().findOne({ where: { id_item: id } });
    if (!item) return [null, 'Item no encontrado.'];
    if (!item.activo) return [null, 'El item ya estaba desactivado.'];
 
    await itemRepo().update(id, { activo: false });
    return [{ message: 'Item eliminado (soft delete)' }, null];
};
 
// ################# MOVIMIENTOS  REGISTRAR #################
 
export const registrarMovimiento = async (data) => {
    const repoItem = itemRepo();
    const repoMov  = movRepo();
 
    const item = await repoItem.findOne({ where: { id_item: data.id_item, activo: true } });
    if (!item) return [null, 'Item no encontrado o inactivo.'];
 
    // Validar stock suficiente antes de descontar
    if (TIPOS_QUE_RESTAN.includes(data.tipo_movimiento)) {
        if (item.stock_actual < data.cantidad)
            return [null, `Stock insuficiente. Disponible: ${item.stock_actual} ${item.unidad_medida}.`];
    }
 
    const movimiento = repoMov.create({
        item,
        id_proyecto:      data.id_proyecto,
        id_emisor:        data.id_emisor,
        id_receptor:      data.id_receptor || null,
        tipo_movimiento:  data.tipo_movimiento,
        cantidad:         data.cantidad,
        descripcion:      data.descripcion || '',
        estado_solicitud: data.tipo_movimiento === 'SOLICITUD' ? 'PENDIENTE' : null
    });
 
    const guardado = await repoMov.save(movimiento);
 
    // Actualizar stock inmediatamente (SOLICITUD espera aprobacion)
    if (TIPOS_QUE_SUMAN.includes(data.tipo_movimiento)) {
        await repoItem.update(item.id_item, { stock_actual: item.stock_actual + data.cantidad });
    } else if (TIPOS_QUE_RESTAN.includes(data.tipo_movimiento)) {
        await repoItem.update(item.id_item, { stock_actual: item.stock_actual - data.cantidad });
    }
 
    return [guardado, null];
};
// ################# MOVIMIENTOS  LEER #################
 
export const obtenerMovimientos = async () => {
    return await movRepo().find({ order: { fecha: 'DESC' } });
};
 
export const obtenerMovimientoPorId = async (id) => {
    const mov = await movRepo().findOne({ where: { id_mov: id } });
    if (!mov) return [null, 'Movimiento no encontrado.'];
    return [mov, null];
};
 
export const obtenerMovimientosPorItem = async (id_item) => {
    return await movRepo().find({
        where: { item: { id_item } },
        order: { fecha: 'DESC' }
    });
};
 
export const obtenerSolicitudesPendientes = async () => {
    return await movRepo().find({
        where: { tipo_movimiento: 'SOLICITUD', estado_solicitud: 'PENDIENTE' },
        order: { fecha: 'ASC' }
    });
};
 
// ################# MOVIMIENTOS RESOLVER SOLICITUD #################
 
export const resolverSolicitud = async (id_mov, decision) => {
    const repoMov  = movRepo();
    const repoItem = itemRepo();
 
    const mov = await repoMov.findOne({ where: { id_mov } });
    if (!mov) return [null, 'Movimiento no encontrado.'];
    if (mov.tipo_movimiento !== 'SOLICITUD') return [null, 'Este movimiento no es una solicitud.'];
    if (mov.estado_solicitud !== 'PENDIENTE') return [null, 'La solicitud ya fue resuelta.'];
 
    // Si se aprueba descontar el stock
    if (decision === 'APROBADO') {
        const item = await repoItem.findOne({ where: { id_item: mov.item.id_item } });
        if (!item) return [null, 'Item asociado no encontrado.'];
        if (item.stock_actual < mov.cantidad)
            return [null, `Stock insuficiente para aprobar. Disponible: ${item.stock_actual} ${item.unidad_medida}.`];
 
        await repoItem.update(item.id_item, { stock_actual: item.stock_actual - mov.cantidad });
    }
 
    mov.estado_solicitud = decision;
    const actualizado = await repoMov.save(mov);
    return [actualizado, null];
};
