const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    audio: {
        defaultDevice: String,
        volume: {
            type: Number,
            default: 1.0,
            min: 0,
            max: 1
        }
    },
    api: {
        allowedIPs: [{
            type: String,
            validate: {
                validator: function(v) {
                    return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v);
                }
            }
        }],
        rateLimit: {
            windowMs: { type: Number, default: 900000 }, // 15 minutos
            max: { type: Number, default: 100 }
        }
    },
    tts: {
        defaultLanguage: {
            type: String,
            default: 'es'
        },
        speed: {
            type: Number,
            default: 1.0,
            min: 0.5,
            max: 2.0
        },
        voice: {
            type: String,
            default: ''
        },
        volume: {
            type: Number,
            default: 100,
            min: 0,
            max: 100
        },
        pitch: {
            type: Number,
            default: 0,
            min: -10,
            max: 10
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'talker_config'
});

module.exports = mongoose.model('Config', configSchema);
