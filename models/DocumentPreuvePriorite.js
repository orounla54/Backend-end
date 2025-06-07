const mongoose = require('mongoose');

const documentPreuvePrioriteSchema = new mongoose.Schema({
    preuveRealisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PreuveRealisationPriorite',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DocumentPreuvePriorite', documentPreuvePrioriteSchema); 