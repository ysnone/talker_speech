const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const configRoutes = require('./routes/config');
const ttsRoutes = require('./routes/tts');
const elRoutes = require('./routes/el');
const config = require('./config/database');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/api/config', configRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/el', elRoutes);

// Conexión a MongoDB
mongoose.connect(config.mongodb.uri, config.mongodb.options)
    .then(() => {
        console.log('Conectado a MongoDB en:', config.mongodb.uri);
    })
    .catch(err => {
        console.error('Error conectando a MongoDB:', err);
    });

// Ruta principal
app.get('/', (req, res) => {
    res.redirect('/config.html');
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: err.message 
    });
});

module.exports = app;
