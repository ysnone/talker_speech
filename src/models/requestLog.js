const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    audioDevice: {
        type: String,
        required: function() {
            return !this.provider || this.provider === 'windows';
        }
    },
    provider: {
        type: String,
        enum: ['windows', 'elevenlabs', 'speechmatics'],
        default: 'windows'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'error', 'stopped'],
        default: 'pending'
    },
    error: {
        type: String
    },
    processingTime: {
        type: Number // en milisegundos
    },
    language: {
        type: String,
        default: 'es'
    }
}, {
    collection: 'talker_requests',
    timestamps: true
});

// Índices para mejorar el rendimiento de las consultas
requestLogSchema.index({ timestamp: -1 });
requestLogSchema.index({ status: 1 });
requestLogSchema.index({ ipAddress: 1 });

module.exports = mongoose.model('RequestLog', requestLogSchema);
