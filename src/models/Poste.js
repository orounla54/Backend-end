const mongoose = require('mongoose');

const posteSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du poste est requis'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true
  },
  niveau: {
    type: String,
    enum: ['junior', 'intermediaire', 'senior', 'expert'],
    default: 'intermediaire'
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour la recherche
posteSchema.index({ nom: 'text', description: 'text' });

module.exports = mongoose.model('Poste', posteSchema); 