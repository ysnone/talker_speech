const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
    engine: {
        type: String,
        required: true,
        enum: ['elevenlabs', 'windows']
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String,
        required: true
    },
    textLength: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    // Campos específicos de ElevenLabs
    elevenlabs: {
        voiceId: String,
        model: String,
        audioDuration: Number, // en segundos
        characterBilling: Number, // cantidad de caracteres facturados
        cost: Number // costo estimado en dólares
    },
    // Campos comunes de audio
    audioDevice: String,
    success: {
        type: Boolean,
        required: true
    },
    error: String,
    processingTime: Number // en milisegundos
});

module.exports = mongoose.model('Execution', executionSchema);
