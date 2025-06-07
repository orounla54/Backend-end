const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema({
    nom: {
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
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    equipe: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypeProjet',
        required: false
    },
    statut: {
        type: String,
        enum: ['planifie', 'en_cours', 'en_pause', 'termine', 'annule'],
        default: 'planifie'
    },
    budget: {
        prevu: Number,
        realise: Number,
        devise: {
            type: String,
            default: 'FCFA'
        }
    },
    progression: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    documents: [{
        nom: String,
        url: String,
        type: String,
        dateUpload: Date
    }],
    commentaires: [{
        auteur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        contenu: String,
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Projet', projetSchema); 