const mongoose = require('mongoose');

const typeProjetSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    couleur: {
        type: String,
        default: '#6366F1' // Couleur indigo par défaut
    },
    icone: {
        type: String,
        default: 'project' // Icône par défaut
    },
    actif: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TypeProjet', typeProjetSchema); 