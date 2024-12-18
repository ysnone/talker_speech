const express = require('express');
const router = express.Router();
const ElController = require('../controllers/elController');

/**
 * @swagger
 * /api/el/config:
 *   get:
 *     summary: Obtiene la configuración de ElevenLabs
 *     tags: [ElevenLabs]
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
 */
router.get('/config', ElController.getConfig);

/**
 * @swagger
 * /api/el/config:
 *   put:
 *     summary: Actualiza la configuración de ElevenLabs
 *     tags: [ElevenLabs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               defaultSettings:
 *                 type: object
 *                 properties:
 *                   voiceId:
 *                     type: string
 *                   model:
 *                     type: string
 *                     enum: [eleven_monolingual_v1, eleven_multilingual_v1]
 *                   stability:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 1
 *                   similarityBoost:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 1
 *                   style:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 1
 *                   speakerBoost:
 *                     type: boolean
 *                   optimizeStreamingLatency:
 *                     type: number
 *                     enum: [0, 1, 2, 3, 4]
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 */
router.put('/config', ElController.updateConfig);

/**
 * @swagger
 * /api/el/config/apikey:
 *   post:
 *     summary: Actualiza la API Key de ElevenLabs
 *     tags: [ElevenLabs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: API Key actualizada exitosamente
 */
router.post('/config/apikey', ElController.updateApiKey);

/**
 * @swagger
 * /api/el/voices:
 *   get:
 *     summary: Obtiene la lista de voces disponibles
 *     tags: [ElevenLabs]
 *     responses:
 *       200:
 *         description: Lista de voces obtenida exitosamente
 */
router.get('/voices', ElController.getVoices);

/**
 * @swagger
 * /api/el/test:
 *   post:
 *     summary: Prueba la conversión de texto a voz
 *     tags: [ElevenLabs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               voiceId:
 *                 type: string
 *               model:
 *                 type: string
 *                 enum: [eleven_monolingual_v1, eleven_multilingual_v1]
 *               stability:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               similarityBoost:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               style:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               speakerBoost:
 *                 type: boolean
 *               optimizeStreamingLatency:
 *                 type: number
 *                 enum: [0, 1, 2, 3, 4]
 *     responses:
 *       200:
 *         description: Audio generado exitosamente
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/test', ElController.testTTS);

module.exports = router;
