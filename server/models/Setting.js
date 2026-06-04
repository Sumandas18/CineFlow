const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    maintenanceMode: { type: Boolean, default: false },
    autoDeleteFailed: { type: Boolean, default: false },
    platformName: { type: String, default: 'CineFlow' },
    supportEmail: { type: String, default: 'support@cineflow.ai' }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
