const mongoose = require('mongoose');

const tacheSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    projet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Projet',
        required: true
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypeTache',
        required: true
    },
    priorite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypePriorite',
        required: true
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dateDebut: {
        type: Date,
        required: true
    },
    dateFin: {
        type: Date,
        required: true
    },
    statut: {
        type: String,
        enum: ['a_faire', 'en_cours', 'en_revision', 'terminee', 'annulee'],
        default: 'a_faire'
    },
    progression: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
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
    }],
    fichiers: [{
        nom: String,
        url: String,
        type: String,
        dateUpload: Date
    }],
    sousTaches: [{
        nom: String,
        description: String,
        statut: {
            type: String,
            enum: ['a_faire', 'en_cours', 'terminee'],
            default: 'a_faire'
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Tache', tacheSchema); 