const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['reel_generated', 'export_started', 'export_completed', 'music_selected', 'plan_upgraded', 'page_view', 'prediction']
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Added for dashboard queries
    reelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel' }, // Added for reel prediction relation
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    metadata: mongoose.Schema.Types.Mixed,
    region: String
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
