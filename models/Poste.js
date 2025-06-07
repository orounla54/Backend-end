const mongoose = require('mongoose');

const posteSchema = new mongoose.Schema({
    libelle: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Poste', posteSchema); 