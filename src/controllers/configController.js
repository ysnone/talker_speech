const Config = require('../models/config');
const AudioDeviceService = require('../services/audioDeviceService');

class ConfigController {
    static async getConfig(req, res) {
        try {
            let config = await Config.findOne();
            if (!config) {
                config = await Config.create({
                    audioDevice: 'default',
                    tts: { 
                        defaultLanguage: 'es',
                        speed: 1.0,
                        volume: 100,
                        pitch: 0
                    }
                });
            }
            
            res.json({
                success: true,
                config
            });
        } catch (error) {
            console.error('Error al obtener configuración:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener la configuración'
            });
        }
    }

    static async getAudioDevices(req, res) {
        try {
            const devices = await AudioDeviceService.getAudioDevices();
            res.json({
                success: true,
                devices: devices.map(device => ({
                    id: device.DeviceID,
                    name: device.Name
                }))
            });
        } catch (error) {
            console.error('Error al obtener dispositivos de audio:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los dispositivos de audio'
            });
        }
    }

    static async updateConfig(req, res) {
        try {
            let config = await Config.findOne();
            if (!config) {
                config = new Config();
            }

            // Actualizar solo los campos permitidos
            if (req.body.audioDevice !== undefined) {
                config.audioDevice = req.body.audioDevice;
            }
            if (req.body.tts !== undefined) {
                config.tts = { ...config.tts, ...req.body.tts };
            }

            await config.save();
            res.json({
                success: true,
                message: 'Configuración actualizada exitosamente',
                config
            });
        } catch (error) {
            console.error('Error al actualizar configuración:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar la configuración'
            });
        }
    }
}

module.exports = ConfigController;
