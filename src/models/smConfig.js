const mongoose = require('mongoose');

const smConfigSchema = new mongoose.Schema({
    apiKey: {
        type: String,
        required: true
    },
    defaultSettings: {
        language: {
            type: String,
            default: 'en'
        },
        operatingPoint: {
            type: String,
            enum: ['enhanced', 'standard'],
            default: 'standard'
        },
        diarization: {
            type: Boolean,
            default: false
        },
        speakerDiarization: {
            enableSpeakerDiarization: {
                type: Boolean,
                default: false
            },
            maxSpeakers: {
                type: Number,
                default: 2
            }
        },
        audioFormat: {
            type: String,
            enum: ['pcm_f32le', 'wav', 'mp3', 'ogg', 'flac'],
            default: 'wav'
        },
        sampleRate: {
            type: Number,
            default: 44100
        },
        channels: {
            type: Number,
            default: 1
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SmConfig', smConfigSchema);
