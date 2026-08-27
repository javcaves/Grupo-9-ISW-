import { Router } from 'express';
import * as NotificacionController from './notificacion.controller.js';
import { authenticateJwt } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';

const router = Router();

router.get('/',
    authenticateJwt,
    NotificacionController.obtenerMisNotificaciones
);

/**
 * Va antes de '/:id_notificacion/leido' porque 'leido-todas' no debe
 * interpretarse como un id.
 */
router.put('/leido-todas',
    authenticateJwt,
    NotificacionController.marcarTodasLeidas
);

router.put('/:id_notificacion/leido',
    authenticateJwt,
    NotificacionController.marcarLeida
);

router.put('/solicitud-password/:id_usuario/rechazar',
    authenticateJwt,
    checkRole(['ROOT', 'ADMIN', 'SUPERVISOR']),
    NotificacionController.rechazarSolicitudPassword
);

export default router;