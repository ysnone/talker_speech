const { execSync } = require('child_process');

class AudioDeviceService {
    static getAudioDevices() {
        try {
            // Usando PowerShell para obtener los dispositivos de audio de reproducción
            const command = `powershell -Command "Get-CimInstance Win32_SoundDevice | Select-Object Name, DeviceID, Status | Where-Object { $_.Status -eq 'OK' } | ConvertTo-Json"`;
            const output = execSync(command).toString();
            const devices = JSON.parse(output);
            return Array.isArray(devices) ? devices : [devices];
        } catch (error) {
            console.error('Error al obtener dispositivos de audio:', error);
            return [];
        }
    }

    static getDefaultDevice() {
        try {
            // Usando un método más simple para obtener el dispositivo predeterminado
            const command = `powershell -Command "Get-CimInstance Win32_SoundDevice | Where-Object { $_.Status -eq 'OK' } | Select-Object -First 1 | ConvertTo-Json"`;
            const output = execSync(command).toString();
            if (!output.trim()) {
                return null;
            }
            return JSON.parse(output);
        } catch (error) {
            console.error('Error al obtener dispositivo predeterminado:', error);
            return null;
        }
    }

    static async setVolume(level) {
        try {
            // Usando un cmdlet más compatible para ajustar el volumen
            const volumeLevel = Math.floor(level * 100);
            const command = `powershell -Command "$volume = Get-WmiObject -Class MSFT_AudioDevice -Namespace root/standardcimv2; $volume.SetVolume(${volumeLevel})"`;
            execSync(command);
            return true;
        } catch (error) {
            console.error('Error al establecer volumen:', error);
            return false;
        }
    }
}

module.exports = AudioDeviceService;
