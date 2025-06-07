const mongoose = require('mongoose');

const sollicitationSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    demandeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    statut: {
        type: String,
        enum: ['en_attente', 'en_cours', 'approuvee', 'refusee'],
        default: 'en_attente'
    },
    type: {
        type: String,
        enum: ['materiel', 'congé', 'formation', 'autre'],
        required: true
    },
    dateDemande: {
        type: Date,
        default: Date.now
    },
    dateReponse: {
        type: Date
    },
    reponse: {
        type: String
    },
    reponduPar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Sollicitation', sollicitationSchema); 