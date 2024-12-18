const ElConfig = require('../models/elConfig');
const RequestLog = require('../models/requestLog');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class ElController {
    static async getConfig(req, res) {
        try {
            let config = await ElConfig.findOne();
            if (!config) {
                config = new ElConfig({
                    apiKey: '',
                    defaultSettings: {}
                });
                await config.save();
            }

            // No enviamos la API key al cliente
            const safeConfig = {
                defaultSettings: config.defaultSettings
            };

            res.json({
                success: true,
                config: safeConfig
            });
        } catch (error) {
            console.error('Error al obtener configuración:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async updateConfig(req, res) {
        try {
            const { defaultSettings } = req.body;
            let config = await ElConfig.findOne();
            
            if (!config) {
                config = new ElConfig();
            }

            if (defaultSettings) {
                config.defaultSettings = {
                    ...config.defaultSettings,
                    ...defaultSettings
                };
            }

            config.updatedAt = new Date();
            await config.save();

            const safeConfig = {
                defaultSettings: config.defaultSettings
            };

            res.json({
                success: true,
                config: safeConfig
            });
        } catch (error) {
            console.error('Error al actualizar configuración:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async updateApiKey(req, res) {
        try {
            const { apiKey } = req.body;
            
            if (!apiKey) {
                throw new Error('API Key es requerida');
            }

            let config = await ElConfig.findOne();
            if (!config) {
                config = new ElConfig();
            }

            config.apiKey = apiKey;
            config.updatedAt = new Date();
            await config.save();

            res.json({
                success: true,
                message: 'API Key actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar API Key:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getVoices(req, res) {
        try {
            const config = await ElConfig.findOne();
            if (!config || !config.apiKey) {
                throw new Error('API Key no configurada');
            }

            const response = await fetch('https://api.elevenlabs.io/v1/voices', {
                headers: {
                    'xi-api-key': config.apiKey
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener voces');
            }

            const data = await response.json();
            res.json({
                success: true,
                voices: data.voices
            });
        } catch (error) {
            console.error('Error al obtener voces:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async testTTS(req, res) {
        const startTime = Date.now();
        const {
            text,
            voiceId,
            model,
            stability,
            similarityBoost,
            style,
            speakerBoost,
            optimizeStreamingLatency
        } = req.body;

        let requestLog;

        try {
            const config = await ElConfig.findOne();
            if (!config || !config.apiKey) {
                throw new Error('API Key no configurada');
            }

            // Registrar la solicitud
            requestLog = new RequestLog({
                ipAddress: req.ip,
                text,
                provider: 'elevenlabs',
                language: 'auto',
                status: 'processing'
            });
            await requestLog.save();

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': config.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text,
                    model_id: model,
                    voice_settings: {
                        stability,
                        similarity_boost: similarityBoost,
                        style,
                        speaker_boost: speakerBoost,
                        optimize_streaming_latency: optimizeStreamingLatency
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error en la API de ElevenLabs');
            }

            // Obtener el audio como arrayBuffer
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = Buffer.from(arrayBuffer);

            requestLog.status = 'completed';
            requestLog.processingTime = Date.now() - startTime;
            await requestLog.save();

            // Enviar el audio como respuesta
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.length
            });
            res.send(audioBuffer);

        } catch (error) {
            console.error('Error en ElevenLabs:', error);
            
            if (requestLog) {
                requestLog.status = 'error';
                requestLog.error = error.message;
                requestLog.processingTime = Date.now() - startTime;
                await requestLog.save();
            }

            res.status(500).json({
                success: false,
                message: 'Error al procesar el texto',
                error: error.message
            });
        }
    }
}

module.exports = ElController;
