const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du service est requis'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true
  },
  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  membres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  postes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poste'
  }],
  projets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Projet'
  }],
  taches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tache'
  }],
  indicateurs: [{
    nom: String,
    valeur: Number,
    unite: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour la recherche
serviceSchema.index({ nom: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema); 