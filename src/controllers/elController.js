const ElConfig = require('../models/elConfig');
const RequestLog = require('../models/requestLog');
const Execution = require('../models/execution');
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
            audioDevice,
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
                audioDevice,
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
                'Content-Length': audioBuffer.length,
                'X-Audio-Device': audioDevice // Enviar el dispositivo de audio en el header
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

    static async speak(req, res) {
        const startTime = Date.now();
        const {
            text,
            audioDevice,
            voiceId,
            model,
            stability,
            similarityBoost,
            style,
            speakerBoost,
            optimizeStreamingLatency
        } = req.body;

        let execution;

        try {
            // Validar texto
            if (!text) {
                throw new Error('El texto es requerido');
            }

            // Obtener configuración
            const config = await ElConfig.findOne();
            if (!config || !config.apiKey) {
                throw new Error('API Key no configurada');
            }

            // Usar valores por defecto si no se proporcionan
            const settings = {
                voiceId: voiceId || config.defaultSettings.voiceId,
                model: model || config.defaultSettings.model,
                stability: stability !== undefined ? stability : config.defaultSettings.stability,
                similarityBoost: similarityBoost !== undefined ? similarityBoost : config.defaultSettings.similarityBoost,
                style: style !== undefined ? style : config.defaultSettings.style,
                speakerBoost: speakerBoost !== undefined ? speakerBoost : config.defaultSettings.speakerBoost,
                optimizeStreamingLatency: optimizeStreamingLatency !== undefined ? optimizeStreamingLatency : config.defaultSettings.optimizeStreamingLatency
            };

            // Crear registro de ejecución
            execution = new Execution({
                engine: 'elevenlabs',
                ipAddress: req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip,
                textLength: text.length,
                text: text,
                audioDevice: audioDevice || 'default',
                elevenlabs: {
                    voiceId: settings.voiceId,
                    model: settings.model
                },
                success: false
            });

            // Llamar a la API de ElevenLabs
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${settings.voiceId}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': config.apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg'
                },
                body: JSON.stringify({
                    text,
                    model_id: settings.model,
                    voice_settings: {
                        stability: settings.stability,
                        similarity_boost: settings.similarityBoost,
                        style: settings.style,
                        speaker_boost: settings.speakerBoost,
                        optimize_streaming_latency: settings.optimizeStreamingLatency
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error en la API de ElevenLabs');
            }

            // Obtener información de la respuesta
            const audioBuffer = Buffer.from(await response.arrayBuffer());

            // Debug: Imprimir todos los headers
            console.log('Headers de ElevenLabs:');
            for (const [key, value] of response.headers.entries()) {
                console.log(`${key}: ${value}`);
            }

            // Obtener headers de la respuesta
            const headers = response.headers;
            const characterBilling = parseInt(headers.get('character-cost') || '0');
            const latencyMs = parseInt(headers.get('tts-latency-ms') || '0');
            const audioDuration = latencyMs / 1000; // Convertir a segundos
            
            console.log('Valores extraídos:');
            console.log('Character Cost:', characterBilling);
            console.log('TTS Latency (ms):', latencyMs);
            console.log('Audio Duration (s):', audioDuration);

            const costPerCharacter = 0.00003; // $0.00003 por carácter según documentación de ElevenLabs
            const cost = characterBilling * costPerCharacter;

            console.log('Costo calculado:', cost);

            // Actualizar registro de ejecución
            execution.elevenlabs.audioDuration = audioDuration;
            execution.elevenlabs.characterBilling = characterBilling;
            execution.elevenlabs.cost = cost;
            execution.success = true;
            execution.processingTime = Date.now() - startTime;

            console.log('Datos a guardar:', {
                audioDuration,
                characterBilling,
                cost,
                latencyMs
            });

            await execution.save();

            // Enviar respuesta
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.length,
                'X-Audio-Device': audioDevice || 'default',
                'X-Audio-Duration': audioDuration,
                'X-Character-Count': characterBilling,
                'X-Cost': cost.toFixed(6),
                'X-Latency-Ms': latencyMs
            });
            res.send(audioBuffer);

        } catch (error) {
            console.error('Error en ElevenLabs speak:', error);
            
            if (execution) {
                execution.success = false;
                execution.error = error.message;
                execution.processingTime = Date.now() - startTime;
                await execution.save();
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
