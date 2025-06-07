const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    typeMedia: {
        type: String,
        enum: ['image', 'video', 'audio', 'document'],
        required: true
    }
});

const preuveSchema = new mongoose.Schema({
    priorite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Priorite',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    documents: [documentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Preuve', preuveSchema); 