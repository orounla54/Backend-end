const mongoose = require('mongoose');

const typePrioriteSchema = new mongoose.Schema({
    libelle: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    couleur: {
        type: String,
        default: '#000000'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TypePriorite', typePrioriteSchema); 