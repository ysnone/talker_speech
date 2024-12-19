const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const sound = require('sound-play');

class AudioDeviceService {
    static async getAudioDevices() {
        try {
            const { stdout } = await execAsync('powershell -Command "Get-AudioDevice -Playback | Select-Object Name, ID, Default | ConvertTo-Json"');
            const devices = JSON.parse(stdout);
            return Array.isArray(devices) ? devices : [devices];
        } catch (error) {
            console.error('Error al obtener dispositivos de audio:', error);
            return [];
        }
    }

    static async getDefaultDevice() {
        try {
            const { stdout } = await execAsync('powershell -Command "Get-AudioDevice -Playback | Where-Object Default -eq $true | Select-Object Name, ID, Default | ConvertTo-Json"');
            return JSON.parse(stdout);
        } catch (error) {
            console.error('Error al obtener dispositivo por defecto:', error);
            return null;
        }
    }

    static async setDefaultDevice(deviceId) {
        try {
            await execAsync(`powershell -Command "Set-AudioDevice -ID '${deviceId}'"`, { windowsHide: true });
            return true;
        } catch (error) {
            console.error('Error al establecer dispositivo por defecto:', error);
            return false;
        }
    }

    static async playAudio(audioBuffer) {
        return new Promise(async (resolve, reject) => {
            try {
                // Guardar el buffer en un archivo temporal
                const tempDir = os.tmpdir();
                const tempFile = path.join(tempDir, `elevenlabs_${Date.now()}.mp3`);
                await fs.writeFile(tempFile, audioBuffer);

                // Reproducir el audio
                await sound.play(tempFile);

                // Eliminar el archivo temporal
                await fs.unlink(tempFile);
                resolve(true);
            } catch (error) {
                console.error('Error al reproducir audio:', error);
                reject(error);
            }
        });
    }
}

module.exports = AudioDeviceService;
