const express = require('express');
const router = express.Router();
const SmController = require('../controllers/smController');

/**
 * @swagger
 * /api/sm/config:
 *   get:
 *     summary: Obtiene la configuración de Speechmatics
 *     tags: [Speechmatics]
 *     responses:
 *       200:
 *         description: Configuración actual
 */
router.get('/config', SmController.getConfig);

/**
 * @swagger
 * /api/sm/config:
 *   put:
 *     summary: Actualiza la configuración de Speechmatics
 *     tags: [Speechmatics]
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
 *                   language:
 *                     type: string
 *                   operatingPoint:
 *                     type: string
 *                     enum: [enhanced, standard]
 *                   diarization:
 *                     type: boolean
 *                   speakerDiarization:
 *                     type: object
 *                     properties:
 *                       enableSpeakerDiarization:
 *                         type: boolean
 *                       maxSpeakers:
 *                         type: number
 *     responses:
 *       200:
 *         description: Configuración actualizada
 */
router.put('/config', SmController.updateConfig);

/**
 * @swagger
 * /api/sm/config/apikey:
 *   post:
 *     summary: Actualiza la API Key de Speechmatics
 *     tags: [Speechmatics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: API Key de Speechmatics
 *     responses:
 *       200:
 *         description: API Key actualizada exitosamente
 */
router.post('/config/apikey', SmController.updateApiKey);

/**
 * @swagger
 * /api/sm/test:
 *   post:
 *     summary: Prueba la conversión de texto usando Speechmatics
 *     tags: [Speechmatics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Texto a convertir
 *               language:
 *                 type: string
 *                 default: en
 *               operatingPoint:
 *                 type: string
 *                 enum: [enhanced, standard]
 *                 default: standard
 *               diarization:
 *                 type: boolean
 *                 default: false
 *               speakerDiarization:
 *                 type: object
 *                 properties:
 *                   enableSpeakerDiarization:
 *                     type: boolean
 *                     default: false
 *                   maxSpeakers:
 *                     type: number
 *                     default: 2
 *     responses:
 *       200:
 *         description: Procesamiento iniciado
 */
router.post('/test', SmController.testTTS);

/**
 * @swagger
 * /api/sm/jobs/{jobId}:
 *   get:
 *     summary: Obtiene el estado de un trabajo de Speechmatics
 *     tags: [Speechmatics]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del trabajo
 *     responses:
 *       200:
 *         description: Estado del trabajo
 */
router.get('/jobs/:jobId', SmController.getJobStatus);

module.exports = router;
