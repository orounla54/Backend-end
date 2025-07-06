const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema({
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
  statut: {
    type: String,
    enum: ['planifié', 'en cours', 'terminé', 'suspendu', 'annulé'],
    default: 'planifié'
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
  membres: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['chef', 'membre', 'observateur'],
      default: 'membre'
    }
  }],
  taches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tache'
  }],
  budget: {
    prevu: Number,
    reel: Number,
    devise: {
      type: String,
      default: 'EUR'
    }
  },
  indicateurs: [{
    nom: String,
    valeur: Number,
    unite: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
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
projetSchema.index({ titre: 'text', description: 'text' });

module.exports = mongoose.model('Projet', projetSchema); 