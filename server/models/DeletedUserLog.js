const mongoose = require('mongoose');

const deletedUserLogSchema = new mongoose.Schema({
    name: String,
    email: String,
    deletedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const DeletedUserLog = mongoose.model('DeletedUserLog', deletedUserLogSchema);
module.exports = DeletedUserLog;
