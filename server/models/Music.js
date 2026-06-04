const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['Cinematic', 'Emotional', 'Dark', 'Travel', 'Hype', 'Chill', 'Motivational'], 
        required: true 
    },
    url: { type: String, required: true },
    duration: Number,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Music', musicSchema);
