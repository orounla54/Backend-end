const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de la position est requis'],
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
    enum: ['operateur', 'technicien', 'ingenieur', 'manager', 'directeur'],
    default: 'technicien'
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
positionSchema.index({ nom: 'text', description: 'text' });

module.exports = mongoose.model('Position', positionSchema); 