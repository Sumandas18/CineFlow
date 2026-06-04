const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sourceImage: { type: String, required: true },
    music: { type: mongoose.Schema.Types.ObjectId, ref: 'Music' },
    musicUrl: String,
    musicTitle: String,
    settings: {
        resolution: { type: String, enum: ['720p', '1080p', '2K', '4K'], default: '1080p' },
        bitrate: { type: String, default: 'medium' }, // low, medium, high
        fps: { type: Number, enum: [24, 30, 60], default: 30 },
        aspectRatio: { type: String, enum: ['9:16', '16:9', '1:1', '4:5'], default: '9:16' }
    },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    progress: { type: Number, default: 0 },
    videoUrl: String,
    errorMessage: String,
    durationEstimate: Number,
    sizeEstimate: Number,
    aiMetadata: {
        captions: [String],
        hashtags: [String],
        bestUploadTime: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Reel', reelSchema);
