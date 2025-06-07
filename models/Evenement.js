const mongoose = require('mongoose');

const evenementSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    dateFin: {
        type: Date,
        required: true
    },
    lieu: {
        type: String,
        required: true
    },
    categorie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategorieEvenement',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    organisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    statut: {
        type: String,
        enum: ['planifie', 'en_cours', 'termine', 'annule'],
        default: 'planifie'
    },
    type: {
        type: String,
        enum: ['reunion', 'formation', 'seminaire', 'autre'],
        required: true
    },
    rappel: {
        type: Boolean,
        default: false
    },
    rappelDate: {
        type: Date
    },
    fichiersConducteurs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileConducteurEvenement'
    }],
    images: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Evenement', evenementSchema); 