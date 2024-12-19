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
 * /api/config/audio-devices:
 *   get:
 *     summary: Obtiene la lista de dispositivos de audio
 *     tags: [Configuración]
 *     responses:
 *       200:
 *         description: Lista de dispositivos de audio disponibles
 */
router.get('/audio-devices', ConfigController.getAudioDevices);

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
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 */
router.put('/', ConfigController.updateConfig);

module.exports = router;
