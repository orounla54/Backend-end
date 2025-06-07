const mongoose = require('mongoose');

const categorieEvenementSchema = new mongoose.Schema({
    libelle: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CategorieEvenement', categorieEvenementSchema); 