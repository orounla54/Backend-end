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
    dateDebut: {
        type: Date,
        required: true
    },
    dateFin: {
        type: Date,
        required: true
    },
    lieu: {
        type: String
    },
    categorie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategorieEvenement',
        required: true
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
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