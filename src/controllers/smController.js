const SmConfig = require('../models/smConfig');
const RequestLog = require('../models/requestLog');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class SmController {
    static async getConfig(req, res) {
        try {
            let config = await SmConfig.findOne();
            if (!config) {
                config = await SmConfig.create({
                    apiKey: '',
                    defaultSettings: {
                        language: 'en',
                        operatingPoint: 'standard',
                        diarization: false,
                        speakerDiarization: {
                            enableSpeakerDiarization: false,
                            maxSpeakers: 2
                        }
                    }
                });
            }
            
            // No enviamos la apiKey al cliente por seguridad
            const safeConfig = config.toObject();
            delete safeConfig.apiKey;
            
            res.json({ config: safeConfig });
        } catch (error) {
            console.error('Error en getConfig:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async updateConfig(req, res) {
        try {
            const { defaultSettings } = req.body;
            
            let config = await SmConfig.findOne();
            if (!config) {
                config = new SmConfig();
            }

            if (defaultSettings) {
                config.defaultSettings = { ...config.defaultSettings, ...defaultSettings };
            }

            config.updatedAt = new Date();
            await config.save();

            // No enviamos la apiKey al cliente por seguridad
            const safeConfig = config.toObject();
            delete safeConfig.apiKey;

            res.json({ message: 'Configuración actualizada', config: safeConfig });
        } catch (error) {
            console.error('Error en updateConfig:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async updateApiKey(req, res) {
        try {
            const { apiKey } = req.body;
            
            if (!apiKey) {
                throw new Error('API Key es requerida');
            }

            let config = await SmConfig.findOne();
            if (!config) {
                config = new SmConfig();
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

    static async testTTS(req, res) {
        const startTime = Date.now();
        const { 
            text,
            language = 'en',
            operatingPoint = 'standard',
            diarization = false,
            speakerDiarization = {
                enableSpeakerDiarization: false,
                maxSpeakers: 2
            }
        } = req.body;
        
        let requestLog;
        
        try {
            const config = await SmConfig.findOne();
            if (!config || !config.apiKey) {
                throw new Error('API Key no configurada');
            }

            // Registrar la solicitud
            requestLog = new RequestLog({
                ipAddress: req.ip,
                text,
                provider: 'speechmatics',
                language,
                status: 'processing'
            });
            await requestLog.save();

            // Configurar la solicitud a Speechmatics
            const response = await fetch('https://asr.api.speechmatics.com/v2/jobs/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'transcription',
                    transcription_config: {
                        language_code: language,
                        operating_point: operatingPoint,
                        enable_diarization: diarization,
                        speaker_diarization_config: diarization ? {
                            number_of_speakers: speakerDiarization.maxSpeakers
                        } : undefined
                    },
                    audio_format: {
                        type: "text",
                        encoding: "ssml"
                    },
                    audio: `<speak>${text}</speak>`
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                console.error('Error de Speechmatics:', data);
                throw new Error(data.error || 'Error en la API de Speechmatics');
            }

            requestLog.status = 'processing';
            requestLog.response = data;
            await requestLog.save();

            res.json({ 
                success: true,
                jobId: data.id,
                message: 'Procesamiento iniciado'
            });
        } catch (error) {
            console.error('Error en Speechmatics:', error);
            
            if (requestLog) {
                requestLog.status = 'error';
                requestLog.error = error.message;
                requestLog.processingTime = Date.now() - startTime;
                await requestLog.save();
            }

            res.status(500).json({ 
                success: false, 
                message: 'Error al procesar el texto',
                error: error.message,
                details: error.response ? await error.response.json() : undefined
            });
        }
    }

    static async getJobStatus(req, res) {
        try {
            const { jobId } = req.params;
            const config = await SmConfig.findOne();
            
            if (!config || !config.apiKey) {
                throw new Error('API Key no configurada');
            }

            const response = await fetch(`https://asr.api.speechmatics.com/v2/jobs/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Error de Speechmatics:', data);
                throw new Error(data.error || 'Error al obtener estado del trabajo');
            }

            res.json({
                success: true,
                status: data.status,
                result: data.output ? data.output.transcript : null
            });
        } catch (error) {
            console.error('Error al obtener estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el estado',
                error: error.message,
                details: error.response ? await error.response.json() : undefined
            });
        }
    }
}

module.exports = SmController;
