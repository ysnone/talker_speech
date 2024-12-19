const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    audioDevice: {
        type: String,
        default: 'default'
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
