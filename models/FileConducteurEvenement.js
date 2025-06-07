const mongoose = require('mongoose');

const fileConducteurEvenementSchema = new mongoose.Schema({
    evenement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evenement',
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

module.exports = mongoose.model('FileConducteurEvenement', fileConducteurEvenementSchema); 