const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: String
    },
    ip: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Log', logSchema); 