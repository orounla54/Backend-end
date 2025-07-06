const mongoose = require('mongoose');

const evenementSchema = new mongoose.Schema({
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
    enum: ['réunion', 'formation', 'événement', 'deadline', 'autre'],
    required: [true, 'Le type est requis']
  },
  dateDebut: {
    type: Date,
    required: [true, 'La date de début est requise']
  },
  dateFin: {
    type: Date,
    required: [true, 'La date de fin est requise']
  },
  lieu: {
    type: String,
    trim: true
  },
  organisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'organisateur est requis']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  participants: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    statut: {
      type: String,
      enum: ['confirmé', 'en attente', 'refusé'],
      default: 'en attente'
    }
  }],
  rappels: [{
    date: Date,
    type: {
      type: String,
      enum: ['email', 'notification', 'sms'],
      default: 'notification'
    },
    envoye: {
      type: Boolean,
      default: false
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
  }],
  couleur: {
    type: String,
    default: '#3788d8'
  },
  repete: {
    type: Boolean,
    default: false
  },
  frequence: {
    type: String,
    enum: ['quotidien', 'hebdomadaire', 'mensuel', 'annuel', null],
    default: null
  },
  finRepetition: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour la recherche
evenementSchema.index({ titre: 'text', description: 'text' });

module.exports = mongoose.model('Evenement', evenementSchema); 