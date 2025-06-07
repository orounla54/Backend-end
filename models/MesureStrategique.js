const mongoose = require('mongoose');

const mesureStrategiqueSchema = new mongoose.Schema({
    libelle: {
        type: String,
        required: true
    },
    objectifStrategique: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ObjectifStrategique',
        required: true
    },
    objectifsOperationnels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ObjectifOperationnel'
    }],
    indicateurs: [{ // Assuming indicators are related to measures
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Indicateur' // Need to create Indicateur model if it doesn't exist
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('MesureStrategique', mesureStrategiqueSchema); 