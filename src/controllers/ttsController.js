const RequestLog = require('../models/requestLog');
const AudioDeviceService = require('../services/audioDeviceService');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const path = require('path');
const fs = require('fs').promises;

let currentTTSProcess = null;
let currentRequestLog = null;

class TTSController {
    static async testTTS(req, res) {
        const startTime = Date.now();
        const { 
            text, 
            language = 'es', 
            speed = 1.0,
            voice = '',
            volume = 100,
            pitch = 0
        } = req.body;
        
        try {
            // Registrar la solicitud
            currentRequestLog = new RequestLog({
                ipAddress: req.ip,
                text,
                audioDevice: 'default',
                language,
                status: 'processing'
            });
            await currentRequestLog.save();

            // Detener cualquier reproducción actual
            if (currentTTSProcess) {
                await TTSController.stopTTS();
            }

            // Crear un archivo temporal para el script de PowerShell
            const tempDir = path.join(__dirname, '..', 'temp');
            await fs.mkdir(tempDir, { recursive: true });
            const scriptPath = path.join(tempDir, `tts_${Date.now()}.ps1`);
            
            const psScript = `
                Add-Type -AssemblyName System.Speech
                $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
                $speak.Rate = ${Math.floor((speed - 1) * 10)}
                $speak.Volume = ${volume}
                ${voice ? '$speak.SelectVoice("' + voice + '")' : ''}
                ${pitch !== 0 ? '$speak.SelectVoiceByHints($speak.Voice.Gender, $speak.Voice.Age, , ' + pitch + ')' : ''}
                
                try {
                    $speak.Speak("${text.replace(/"/g, '\\"')}")
                    Write-Host "TTS_COMPLETED"
                }
                catch {
                    Write-Error $_.Exception.Message
                    exit 1
                }
                finally {
                    $speak.Dispose()
                }
            `;
            
            await fs.writeFile(scriptPath, psScript);

            // Ejecutar el script
            currentTTSProcess = exec(`powershell -ExecutionPolicy Bypass -NoProfile -File "${scriptPath}"`, async (error, stdout, stderr) => {
                try {
                    // Limpiar archivo temporal
                    await fs.unlink(scriptPath).catch(console.error);
                    
                    if (currentRequestLog) {
                        if (error && !stdout.includes('TTS_COMPLETED')) {
                            console.error('Error en proceso TTS:', error);
                            currentRequestLog.status = 'error';
                            currentRequestLog.error = stderr || error.message;
                        } else {
                            currentRequestLog.status = 'completed';
                        }
                        
                        currentRequestLog.processingTime = Date.now() - startTime;
                        await currentRequestLog.save();
                    }

                    currentTTSProcess = null;
                } catch (err) {
                    console.error('Error al finalizar TTS:', err);
                }
            });

            // Enviar respuesta inmediata
            res.json({ 
                success: true, 
                message: 'Procesamiento de texto iniciado',
                requestId: currentRequestLog._id
            });
        } catch (error) {
            console.error('Error en TTS:', error);
            
            if (currentRequestLog) {
                currentRequestLog.status = 'error';
                currentRequestLog.error = error.message;
                currentRequestLog.processingTime = Date.now() - startTime;
                await currentRequestLog.save();
            }

            res.status(500).json({ 
                success: false, 
                message: 'Error al procesar el texto',
                error: error.message 
            });
        }
    }

    static async stopTTS(req, res) {
        try {
            if (currentTTSProcess) {
                // En Windows, necesitamos matar el proceso de PowerShell
                const killCommand = 'powershell -Command "Get-Process -Name \'powershell\' | Where-Object { $_.CommandLine -like \'*System.Speech.Synthesis.SpeechSynthesizer*\' } | Stop-Process -Force"';
                await execAsync(killCommand);
                currentTTSProcess = null;

                // Actualizar el estado del registro actual si existe
                if (currentRequestLog) {
                    currentRequestLog.status = 'stopped';
                    currentRequestLog.error = 'Reproducción detenida por el usuario';
                    await currentRequestLog.save();
                }
            }
            
            if (res) {
                res.json({ success: true, message: 'Reproducción detenida' });
            }
        } catch (error) {
            console.error('Error al detener TTS:', error);
            if (res) {
                res.status(500).json({ 
                    success: false, 
                    message: 'Error al detener la reproducción',
                    error: error.message 
                });
            }
        }
    }

    static async getVoices(req, res) {
        try {
            const command = `powershell -Command "Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo } | Select-Object Name, Culture, Gender, Age | ConvertTo-Json"`;
            const { stdout } = await execAsync(command);
            const voices = JSON.parse(stdout);
            res.json(voices);
        } catch (error) {
            console.error('Error al obtener voces:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al obtener las voces disponibles',
                error: error.message 
            });
        }
    }

    static async getStatus(req, res) {
        try {
            const { requestId } = req.params;
            const requestLog = await RequestLog.findById(requestId);
            
            if (!requestLog) {
                return res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada'
                });
            }

            res.json({
                success: true,
                status: requestLog.status,
                processingTime: requestLog.processingTime
            });
        } catch (error) {
            console.error('Error al obtener estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el estado',
                error: error.message
            });
        }
    }
}

module.exports = TTSController;
