const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    nom: { type: String, required: true, unique: true },
    description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Position', positionSchema); 