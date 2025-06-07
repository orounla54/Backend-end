const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    poste: {
        type: String
    },
    departement: {
        type: String
    },
    telephone: {
        type: String
    },
    adresse: {
        type: String
    },
    competences: [{
        type: String
    }],
    experience: [{
        type: String
    }],
    formation: [{
        type: String
    }],
    bio: {
        type: String
    },
    photo: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema); 