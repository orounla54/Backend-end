const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    destinataire: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le destinataire est requis']
    },
    type: {
        type: String,
        enum: {
            values: [
                'tache', 'projet', 'document', 'commentaire', 
                'mention', 'echeance', 'validation', 'systeme'
            ],
            message: 'Type de notification non valide'
        },
        required: [true, 'Le type est requis']
    },
    titre: {
        type: String,
        required: [true, 'Le titre est requis'],
        trim: true,
        maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
    },
    message: {
        type: String,
        required: [true, 'Le message est requis'],
        trim: true
    },
    priorite: {
        type: String,
        enum: {
            values: ['basse', 'normale', 'haute', 'urgente'],
            message: 'Priorité non valide'
        },
        default: 'normale'
    },
    reference: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'type',
        required: [true, 'La référence est requise']
    },
    lien: {
        type: String,
        trim: true
    },
    statut: {
        type: String,
        enum: {
            values: ['non_lu', 'lu', 'archive'],
            message: 'Statut non valide'
        },
        default: 'non_lu'
    },
    dateLecture: Date,
    actions: [{
        type: {
            type: String,
            enum: ['accepter', 'refuser', 'valider', 'rejeter', 'voir', 'ignorer'],
            required: true
        },
        label: {
            type: String,
            required: true
        },
        lien: String,
        effectue: {
            type: Boolean,
            default: false
        },
        dateAction: Date
    }],
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
notificationSchema.index({ destinataire: 1, createdAt: -1 });
notificationSchema.index({ type: 1, reference: 1 });
notificationSchema.index({ statut: 1 });
notificationSchema.index({ priorite: 1 });
notificationSchema.index({ 'actions.effectue': 1 });

// Méthode pour marquer comme lu
notificationSchema.methods.marquerCommeLu = function() {
    this.statut = 'lu';
    this.dateLecture = new Date();
    return this.save();
};

// Méthode pour archiver
notificationSchema.methods.archiver = function() {
    this.statut = 'archive';
    return this.save();
};

// Méthode pour effectuer une action
notificationSchema.methods.effectuerAction = function(typeAction) {
    const action = this.actions.find(a => a.type === typeAction);
    if (action) {
        action.effectue = true;
        action.dateAction = new Date();
        return this.save();
    }
    throw new Error('Action non trouvée');
};

// Méthode pour ajouter une action
notificationSchema.methods.ajouterAction = function(type, label, lien) {
    this.actions.push({
        type,
        label,
        lien,
        effectue: false
    });
    return this.save();
};

// Méthode statique pour créer une notification de tâche
notificationSchema.statics.creerNotificationTache = function(destinataireId, tacheId, type, message) {
    return this.create({
        destinataire: destinataireId,
        type: 'tache',
        reference: tacheId,
        titre: `Notification de tâche - ${type}`,
        message,
        priorite: 'normale',
        lien: `/taches/${tacheId}`
    });
};

// Méthode statique pour créer une notification de projet
notificationSchema.statics.creerNotificationProjet = function(destinataireId, projetId, type, message) {
    return this.create({
        destinataire: destinataireId,
        type: 'projet',
        reference: projetId,
        titre: `Notification de projet - ${type}`,
        message,
        priorite: 'normale',
        lien: `/projets/${projetId}`
    });
};

// Méthode statique pour créer une notification d'échéance
notificationSchema.statics.creerNotificationEcheance = function(destinataireId, referenceId, type, message, dateEcheance) {
    return this.create({
        destinataire: destinataireId,
        type: 'echeance',
        reference: referenceId,
        titre: `Échéance - ${type}`,
        message,
        priorite: 'haute',
        lien: `/echeances/${referenceId}`,
        metadata: {
            dateEcheance
        }
    });
};

// Middleware pour nettoyer les notifications archivées après 30 jours
notificationSchema.pre('save', function(next) {
    if (this.statut === 'archive' && this.updatedAt) {
        const trenteJours = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - this.updatedAt > trenteJours) {
            this.isActive = false;
        }
    }
    next();
});

module.exports = mongoose.model('Notification', notificationSchema); 