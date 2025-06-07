const mongoose = require('mongoose');

const axeSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    objectifs: [{
        description: String,
        indicateurs: [String],
        cibles: [String],
        echeances: Date
    }],
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const planStrategiqueSchema = new mongoose.Schema({
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
    axes: [axeSchema],
    statut: {
        type: String,
        enum: ['en_cours', 'termine', 'annule'],
        default: 'en_cours'
    },
    porteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    budget: {
        montant: Number,
        devise: {
            type: String,
            default: 'EUR'
        }
    },
    indicateurs: [{
        nom: String,
        description: String,
        valeur: Number,
        unite: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('PlanStrategique', planStrategiqueSchema); 