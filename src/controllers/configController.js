const Config = require('../models/config');
const AudioDeviceService = require('../services/audioDeviceService');

class ConfigController {
    static async getConfig(req, res) {
        try {
            let config = await Config.findOne();
            if (!config) {
                config = await Config.create({
                    audio: { volume: 1.0 },
                    tts: { 
                        defaultLanguage: 'es',
                        speed: 1.0,
                        volume: 100,
                        pitch: 0
                    }
                });
            }
            
            // Obtener dispositivos de audio disponibles
            const audioDevices = await AudioDeviceService.getAudioDevices();
            const currentDevice = await AudioDeviceService.getDefaultDevice();

            if (currentDevice && !config.audio.defaultDevice) {
                config.audio.defaultDevice = currentDevice.DeviceID;
                await config.save();
            }
            
            res.json({
                config,
                audioDevices,
                currentDevice
            });
        } catch (error) {
            console.error('Error en getConfig:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async updateConfig(req, res) {
        try {
            const { audio, api, tts } = req.body;
            
            let config = await Config.findOne();
            if (!config) {
                config = new Config();
            }

            // Actualizar configuración
            if (audio) {
                config.audio = { ...config.audio, ...audio };
            }
            if (api) {
                // Asegurarse de que allowedIPs sea un array
                if (api.allowedIPs && !Array.isArray(api.allowedIPs)) {
                    api.allowedIPs = [api.allowedIPs];
                }
                config.api = { ...config.api, ...api };
            }
            if (tts) {
                config.tts = { ...config.tts, ...tts };
            }

            config.updatedAt = new Date();
            await config.save();

            res.json({ message: 'Configuración actualizada', config });
        } catch (error) {
            console.error('Error en updateConfig:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getAudioDevices(req, res) {
        try {
            const devices = await AudioDeviceService.getAudioDevices();
            res.json(devices);
        } catch (error) {
            console.error('Error en getAudioDevices:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ConfigController;
