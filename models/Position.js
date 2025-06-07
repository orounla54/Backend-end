const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    libelle: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Position', positionSchema); 