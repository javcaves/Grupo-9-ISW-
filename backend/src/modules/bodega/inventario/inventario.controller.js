/**
 * @file inventario.controller.js
 * @description Controlador para el módulo de inventario de la bodega
 */

// 1. Imports (Librerías externas -> Propias)
import * as InventarioService from './inventario.service.js';
import validators from '../../../shared/validators.js';

// 2. Helper functions (Funciones internas no exportadas)
const sendResponse = (res, status, payload) => {
    const isError = status >= 400;
    return res.status(status).json({ [isError ? 'error' : 'data']: payload });
};

// 3. Main functions (Funciones que exportaremos)


// 4. Exports