const mongoose = require('mongoose');

const objectifOperationnelSchema = new mongoose.Schema({
    libelle: {
        type: String,
        required: true
    },
    mesureStrategique: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MesureStrategique',
        required: true
    },
    indicateurs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Indicateur' // Need to create Indicateur model if it doesn't exist
    }],
    taches: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Tache'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('ObjectifOperationnel', objectifOperationnelSchema); 