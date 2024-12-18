const express = require('express');
const router = express.Router();
const TTSController = require('../controllers/ttsController');

/**
 * @swagger
 * /api/tts/test:
 *   post:
 *     summary: Prueba la conversión de texto a voz
 *     tags: [TTS]
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
 *               language:
 *                 type: string
 *                 default: es
 *               speed:
 *                 type: number
 *                 default: 1.0
 *               voice:
 *                 type: string
 *                 description: Nombre de la voz a utilizar
 *               volume:
 *                 type: number
 *                 default: 100
 *               pitch:
 *                 type: number
 *                 default: 0
 *     responses:
 *       200:
 *         description: Procesamiento de texto iniciado
 */
router.post('/test', TTSController.testTTS);

/**
 * @swagger
 * /api/tts/stop:
 *   post:
 *     summary: Detiene la reproducción actual
 *     tags: [TTS]
 *     responses:
 *       200:
 *         description: Reproducción detenida exitosamente
 */
router.post('/stop', TTSController.stopTTS);

/**
 * @swagger
 * /api/tts/voices:
 *   get:
 *     summary: Obtiene las voces disponibles
 *     tags: [TTS]
 *     responses:
 *       200:
 *         description: Lista de voces disponibles
 */
router.get('/voices', TTSController.getVoices);

/**
 * @swagger
 * /api/tts/status/{requestId}:
 *   get:
 *     summary: Obtiene el estado de una solicitud TTS
 *     tags: [TTS]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud TTS
 *     responses:
 *       200:
 *         description: Estado de la solicitud
 */
router.get('/status/:requestId', TTSController.getStatus);

module.exports = router;
