const mongoose = require('mongoose');

const elConfigSchema = new mongoose.Schema({
    apiKey: {
        type: String,
        required: true
    },
    defaultSettings: {
        voiceId: {
            type: String,
            required: true,
            default: "21m00Tcm4TlvDq8ikWAM" // Rachel voice
        },
        model: {
            type: String,
            enum: ['eleven_monolingual_v1', 'eleven_multilingual_v1'],
            default: 'eleven_multilingual_v1'
        },
        stability: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.5
        },
        similarityBoost: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.75
        },
        style: {
            type: Number,
            min: 0,
            max: 1,
            default: 0
        },
        speakerBoost: {
            type: Boolean,
            default: true
        },
        optimizeStreamingLatency: {
            type: Number,
            enum: [0, 1, 2, 3, 4],
            default: 0
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ElConfig', elConfigSchema);
