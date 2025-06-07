const mongoose = require('mongoose');

const typeTacheSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    couleur: {
        type: String,
        default: '#000000' // Default color
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TypeTache', typeTacheSchema); 