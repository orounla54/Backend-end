const mongoose = require('mongoose');

const indicateurDPSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Assuming indicator data might be stored as a flexible object or specific fields
    // For now, adding a generic data field.
    data: {
        type: Object,
        default: {}
    }
    // More specific fields could be added here based on what an "Indicateur DP" represents
}, {
    timestamps: true
});

module.exports = mongoose.model('IndicateurDP', indicateurDPSchema); 