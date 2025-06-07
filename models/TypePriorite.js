const mongoose = require('mongoose');

const typePrioriteSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true
    },
    niveau: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    couleur: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TypePriorite', typePrioriteSchema); 