const express = require('express');
const router = express.Router();
const ConfigController = require('../controllers/configController');

/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Obtiene la configuración actual
 *     tags: [Configuración]
 *     responses:
 *       200:
 *         description: Configuración actual del sistema
 */
router.get('/', ConfigController.getConfig);

/**
 * @swagger
 * /api/config:
 *   put:
 *     summary: Actualiza la configuración
 *     tags: [Configuración]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: object
 *               api:
 *                 type: object
 *               tts:
 *                 type: object
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 */
router.put('/', ConfigController.updateConfig);

/**
 * @swagger
 * /api/config/audio-devices:
 *   get:
 *     summary: Obtiene los dispositivos de audio disponibles
 *     tags: [Configuración]
 *     responses:
 *       200:
 *         description: Lista de dispositivos de audio
 */
router.get('/audio-devices', ConfigController.getAudioDevices);

module.exports = router;
