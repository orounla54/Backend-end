const mongoose = require('mongoose');

const tacheSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true
  },
  type: {
    type: String,
    enum: ['urgent', 'important', 'normal', 'basse'],
    default: 'normal'
  },
  statut: {
    type: String,
    enum: ['à faire', 'en cours', 'terminée', 'annulée'],
    default: 'à faire'
  },
  dateDebut: {
    type: Date,
    required: [true, 'La date de début est requise']
  },
  dateFin: {
    type: Date,
    required: [true, 'La date de fin est requise']
  },
  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le responsable est requis']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Le service est requis']
  },
  projet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Projet'
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentaires: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contenu: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  fichiers: [{
    nom: String,
    url: String,
    type: String,
    taille: Number,
    dateUpload: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index pour la recherche
tacheSchema.index({ titre: 'text', description: 'text' });

module.exports = mongoose.model('Tache', tacheSchema); 