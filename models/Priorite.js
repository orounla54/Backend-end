const mongoose = require('mongoose');

const prioriteSchema = new mongoose.Schema({
    libelle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    typePriorite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypePriorite',
        required: true
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    taches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tache'
    }],
    status: {
        type: String,
        enum: ['en_cours', 'terminee', 'en_attente'],
        default: 'en_attente'
    },
    dateDebut: {
        type: Date,
        required: true
    },
    dateFin: {
        type: Date,
        required: true
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

module.exports = mongoose.model('Priorite', prioriteSchema); 