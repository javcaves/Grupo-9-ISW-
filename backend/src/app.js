import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import routes from './routes/index.routes.js';
import passport from 'passport';
import { passportJwtSetup } from './auth/passport.config.js';
import cookieParser from 'cookie-parser';

const app = express();


// =============================
// MIDDLEWARES
// =============================

app.use(cors());

app.use(morgan('dev'));

app.use(express.json());


// =============================
// HEALTH CHECK
// =============================

app.get('/api/health', (req, res) => {

    res.json({
        status: 'ok',
        message: 'Servidor funcionando correctamente'
    });

});


// =============================
// INICIALIZAR JWT
// =============================
app.use(cookieParser());

passportJwtSetup();

app.use(passport.initialize());

// =============================
// RUTAS
// =============================

app.use('/api', routes);


// =============================
// 404
// =============================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Recurso no encontrado"
    });

});


// =============================
// ERROR GLOBAL
// =============================

app.use((err, req, res, next) => {

    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: "Error interno del servidor"
    });

});


export default app;