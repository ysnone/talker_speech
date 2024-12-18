const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Talker',
            version: '1.0.0',
            description: 'API para el servicio de texto a voz Talker',
        },
        servers: [
            {
                url: 'http://localhost:7000',
                description: 'Servidor de desarrollo',
            },
        ],
        tags: [
            {
                name: 'TTS',
                description: 'Endpoints para Windows Text-to-Speech'
            },
            {
                name: 'Speechmatics',
                description: 'Endpoints para servicios de Speechmatics'
            },
            {
                name: 'Config',
                description: 'Endpoints de configuración general'
            }
        ]
    },
    apis: [
        './src/routes/*.js',
    ],
};

module.exports = swaggerJsdoc(options);
