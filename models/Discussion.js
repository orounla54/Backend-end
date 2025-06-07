const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    contenu: {
        type: String,
        required: true
    },
    expediteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lu: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

const discussionSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [messageSchema],
    type: {
        type: String,
        enum: ['general', 'projet', 'prive'],
        default: 'general'
    },
    projet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Projet'
    },
    statut: {
        type: String,
        enum: ['active', 'archivee'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
discussionSchema.index({ titre: 'text' });
discussionSchema.index({ type: 1, reference: 1 });
discussionSchema.index({ createur: 1 });
discussionSchema.index({ 'participants.utilisateur': 1 });
discussionSchema.index({ statut: 1 });
discussionSchema.index({ confidentialite: 1 });
discussionSchema.index({ derniereActivite: -1 });
discussionSchema.index({ tags: 1 });

// Méthode pour ajouter un message
discussionSchema.methods.ajouterMessage = function(auteurId, contenu, type = 'texte', piecesJointes = [], mentions = []) {
    this.messages.push({
        auteur: auteurId,
        contenu,
        type,
        piecesJointes,
        mentions,
        date: new Date()
    });
    this.derniereActivite = new Date();
    return this.save();
};

// Méthode pour ajouter une réponse à un message
discussionSchema.methods.ajouterReponse = function(messageId, auteurId, contenu) {
    const message = this.messages.id(messageId);
    if (message) {
        message.reponses.push({
            auteur: auteurId,
            contenu,
            date: new Date()
        });
        this.derniereActivite = new Date();
        return this.save();
    }
    throw new Error('Message non trouvé');
};

// Méthode pour ajouter une réaction à un message
discussionSchema.methods.ajouterReaction = function(messageId, utilisateurId, type) {
    const message = this.messages.id(messageId);
    if (message) {
        const reactionExistante = message.reactions.find(r => 
            r.utilisateur.toString() === utilisateurId.toString()
        );
        
        if (reactionExistante) {
            reactionExistante.type = type;
            reactionExistante.date = new Date();
        } else {
            message.reactions.push({
                utilisateur: utilisateurId,
                type,
                date: new Date()
            });
        }
        
        return this.save();
    }
    throw new Error('Message non trouvé');
};

// Méthode pour ajouter un participant
discussionSchema.methods.ajouterParticipant = function(utilisateurId, role = 'participant') {
    if (!this.participants.some(p => p.utilisateur.toString() === utilisateurId.toString())) {
        this.participants.push({
            utilisateur: utilisateurId,
            role,
            dateAjout: new Date()
        });
        return this.save();
    }
    throw new Error('L\'utilisateur est déjà participant');
};

// Méthode pour vérifier les permissions d'accès
discussionSchema.methods.verifierAcces = function(user) {
    if (this.confidentialite === 'public') return true;
    if (user.role === 'admin') return true;
    return this.participants.some(p => p.utilisateur.toString() === user._id.toString());
};

// Middleware pour mettre à jour la dernière activité
discussionSchema.pre('save', function(next) {
    if (this.isModified('messages')) {
        this.derniereActivite = new Date();
    }
    next();
});

module.exports = mongoose.model('Discussion', discussionSchema); 