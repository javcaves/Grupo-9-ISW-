import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rrhhRoutes from '../routes/rrhh.routes.js';
import bodegaRoutes from '../routes/bodega.routes.js';
import actividadesRoutes from '../routes/actividades.routes.js';

const app = express();

// ################# MIDDLEWARES #################
app.use(cors()); 
app.use(morgan('dev')); 
app.use(express.json());

// ################# RUTAS #################
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

app.use('/api/rrhh', rrhhRoutes);
app.use('/api/bodega', bodegaRoutes);
app.use('/api/actividades', actividadesRoutes);

// ################# MANEJO DE ERRORES #################

app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

export default app;