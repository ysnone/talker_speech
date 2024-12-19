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
 *         description: Configuración actual de ElevenLabs
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
 *     summary: Obtiene las voces disponibles en ElevenLabs
 *     tags: [ElevenLabs]
 *     responses:
 *       200:
 *         description: Lista de voces disponibles
 */
router.get('/voices', ElController.getVoices);

/**
 * @swagger
 * /api/el/test:
 *   post:
 *     summary: Prueba la generación de voz
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
 *     responses:
 *       200:
 *         description: Audio generado exitosamente
 */
router.post('/test', ElController.testTTS);

/**
 * @swagger
 * /api/el/speak:
 *   post:
 *     summary: Genera y reproduce audio desde texto
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
 *                 description: Texto a convertir en voz
 *               voiceId:
 *                 type: string
 *                 description: ID de la voz a usar (opcional)
 *               model:
 *                 type: string
 *                 description: Modelo a usar (opcional)
 *               stability:
 *                 type: number
 *                 description: Estabilidad de la voz (0-1) (opcional)
 *               similarityBoost:
 *                 type: number
 *                 description: Mejora de similitud (0-1) (opcional)
 *               style:
 *                 type: number
 *                 description: Estilo de la voz (0-1) (opcional)
 *               speakerBoost:
 *                 type: boolean
 *                 description: Mejora de hablante (opcional)
 *               audioDevice:
 *                 type: string
 *                 description: ID del dispositivo de audio (opcional)
 *     responses:
 *       200:
 *         description: Audio generado y reproducido exitosamente
 *       400:
 *         description: Error en los parámetros de la solicitud
 *       500:
 *         description: Error del servidor
 */
router.post('/speak', ElController.speak);

module.exports = router;
