import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import rrhhRoutes from '../routes/rrhh.routes.js';
//import bodegaRoutes from '../routes/bodega.routes.js';
//import actividadesRoutes from '../routes/actividades.routes.js';

const app = express();

app.use(cors()); 
app.use(morgan('dev')); 
app.use(express.json());

// ################# CHECKEO DE QUE CORRE BIEN :D #################
// BORRAR EN VERSIÓN FINAL
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// ################# RUTAS #################
app.use('/api/rrhh', rrhhRoutes);
//app.use('/api/bodega', bodegaRoutes);
//app.use('/api/actividades', actividadesRoutes);

// ################# MANEJO DE ERRORES #################
// MANEJO DE ERRORES FUERA DE APP???
app.use((req, res, next) => {
    res.status(404).json({ error: "Recurso no encontrado" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Error interno del servidor" });
});

export default app;