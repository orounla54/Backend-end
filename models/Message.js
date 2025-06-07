const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    contenu: {
        type: String,
        required: true,
        trim: true
    },
    auteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    discussion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
messageSchema.index({ discussion: 1, createdAt: -1 });
messageSchema.index({ auteur: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ 'mentions': 1 });
messageSchema.index({ 'lu.utilisateur': 1 });
messageSchema.index({ parent: 1 });

// Méthode pour ajouter une réponse
messageSchema.methods.ajouterReponse = function(auteurId, contenu) {
    this.reponses.push({
        auteur: auteurId,
        contenu,
        date: new Date()
    });
    return this.save();
};

// Méthode pour ajouter une réaction
messageSchema.methods.ajouterReaction = function(utilisateurId, type) {
    const reactionExistante = this.reactions.find(r => 
        r.utilisateur.toString() === utilisateurId.toString()
    );
    
    if (reactionExistante) {
        reactionExistante.type = type;
        reactionExistante.date = new Date();
    } else {
        this.reactions.push({
            utilisateur: utilisateurId,
            type,
            date: new Date()
        });
    }
    
    return this.save();
};

// Méthode pour marquer comme lu
messageSchema.methods.marquerCommeLu = function(utilisateurId) {
    if (!this.lu.some(l => l.utilisateur.toString() === utilisateurId.toString())) {
        this.lu.push({
            utilisateur: utilisateurId,
            date: new Date()
        });
        return this.save();
    }
    return Promise.resolve(this);
};

// Méthode pour modifier le message
messageSchema.methods.modifier = function(nouveauContenu) {
    this.contenu = nouveauContenu;
    this.modifie = true;
    this.dateModification = new Date();
    return this.save();
};

// Méthode pour vérifier si un utilisateur a accès au message
messageSchema.methods.verifierAcces = async function(user) {
    const Discussion = mongoose.model('Discussion');
    const discussion = await Discussion.findById(this.discussion);
    return discussion.verifierAcces(user);
};

// Middleware pour nettoyer les références lors de la suppression
messageSchema.pre('remove', async function(next) {
    try {
        // Supprimer les réponses qui pointent vers ce message
        await this.model('Message').updateMany(
            { parent: this._id },
            { $unset: { parent: 1 } }
        );
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Message', messageSchema); 