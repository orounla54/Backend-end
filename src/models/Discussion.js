const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contenu: {
    type: String,
    required: [true, 'Le contenu du message est requis'],
    trim: true
  },
  lu: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  piecesJointes: [{
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

const discussionSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  type: {
    type: String,
    enum: ['direct', 'groupe', 'projet', 'service'],
    required: true
  },
  participants: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'membre'],
      default: 'membre'
    },
    dateAjout: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [messageSchema],
  projet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Projet'
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  derniereActivite: {
    type: Date,
    default: Date.now
  },
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour la recherche
discussionSchema.index({ titre: 'text' });
messageSchema.index({ contenu: 'text' });

module.exports = mongoose.model('Discussion', discussionSchema); 