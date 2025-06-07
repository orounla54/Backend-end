const mongoose = require('mongoose');

const allocationRessourceSchema = new mongoose.Schema({
    ressource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ressource',
        required: [true, 'La ressource est requise']
    },
    projet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Projet',
        required: [true, 'Le projet est requis']
    },
    tache: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tache'
    },
    debut: {
        type: Date,
        required: [true, 'La date de début est requise']
    },
    fin: {
        type: Date,
        required: [true, 'La date de fin est requise']
    },
    charge: {
        type: Number,
        required: [true, 'La charge est requise'],
        min: [0, 'La charge ne peut pas être négative'],
        max: [100, 'La charge ne peut pas dépasser 100%'],
        default: 100
    },
    statut: {
        type: String,
        enum: {
            values: ['planifie', 'en_cours', 'termine', 'annule'],
            message: 'Statut non valide'
        },
        default: 'planifie'
    },
    priorite: {
        type: String,
        enum: {
            values: ['basse', 'normale', 'haute', 'critique'],
            message: 'Priorité non valide'
        },
        default: 'normale'
    },
    cout: {
        prevu: {
            montant: {
                type: Number,
                min: [0, 'Le montant prévu ne peut pas être négatif']
            },
            devise: {
                type: String,
                default: 'EUR'
            }
        },
        reel: {
            montant: {
                type: Number,
                min: [0, 'Le montant réel ne peut pas être négatif']
            },
            devise: {
                type: String,
                default: 'EUR'
            }
        }
    },
    progression: {
        type: Number,
        min: [0, 'La progression ne peut pas être négative'],
        max: [100, 'La progression ne peut pas dépasser 100%'],
        default: 0
    },
    commentaires: [{
        texte: {
            type: String,
            required: true
        },
        auteur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    historique: [{
        date: {
            type: Date,
            default: Date.now
        },
        action: {
            type: String,
            required: true
        },
        utilisateur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        details: mongoose.Schema.Types.Mixed
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
allocationRessourceSchema.index({ ressource: 1, projet: 1 });
allocationRessourceSchema.index({ debut: 1, fin: 1 });
allocationRessourceSchema.index({ statut: 1 });
allocationRessourceSchema.index({ priorite: 1 });

// Méthode pour vérifier les conflits d'allocation
allocationRessourceSchema.statics.verifierConflits = async function(ressourceId, debut, fin, exclusionId = null) {
    const query = {
        ressource: ressourceId,
        isActive: true,
        $or: [
            { debut: { $lt: fin, $gte: debut } },
            { fin: { $gt: debut, $lte: fin } },
            { debut: { $lte: debut }, fin: { $gte: fin } }
        ]
    };

    if (exclusionId) {
        query._id = { $ne: exclusionId };
    }

    return this.find(query);
};

// Méthode pour calculer la charge totale
allocationRessourceSchema.statics.calculerChargeTotale = async function(ressourceId, debut, fin) {
    const allocations = await this.find({
        ressource: ressourceId,
        isActive: true,
        $or: [
            { debut: { $lt: fin, $gte: debut } },
            { fin: { $gt: debut, $lte: fin } },
            { debut: { $lte: debut }, fin: { $gte: fin } }
        ]
    });

    return allocations.reduce((total, allocation) => total + allocation.charge, 0);
};

// Méthode pour mettre à jour la progression
allocationRessourceSchema.methods.mettreAJourProgression = function(nouvelleProgression) {
    if (nouvelleProgression < 0 || nouvelleProgression > 100) {
        throw new Error('La progression doit être comprise entre 0 et 100');
    }

    this.progression = nouvelleProgression;
    
    // Mettre à jour le statut en fonction de la progression
    if (nouvelleProgression === 0) {
        this.statut = 'planifie';
    } else if (nouvelleProgression === 100) {
        this.statut = 'termine';
    } else {
        this.statut = 'en_cours';
    }

    return this.save();
};

// Méthode pour ajouter un commentaire
allocationRessourceSchema.methods.ajouterCommentaire = function(texte, auteurId) {
    this.commentaires.push({
        texte,
        auteur: auteurId,
        date: new Date()
    });
    return this.save();
};

// Méthode pour mettre à jour le coût réel
allocationRessourceSchema.methods.mettreAJourCoutReel = function(montant, devise = 'EUR') {
    this.cout.reel = {
        montant,
        devise
    };
    return this.save();
};

// Méthode pour ajouter une entrée dans l'historique
allocationRessourceSchema.methods.ajouterHistorique = function(action, utilisateurId, details = {}) {
    this.historique.push({
        date: new Date(),
        action,
        utilisateur: utilisateurId,
        details
    });
    return this.save();
};

// Middleware pour vérifier les dates avant la sauvegarde
allocationRessourceSchema.pre('save', async function(next) {
    if (this.isModified('debut') || this.isModified('fin')) {
        if (this.debut >= this.fin) {
            throw new Error('La date de début doit être antérieure à la date de fin');
        }

        // Vérifier les conflits d'allocation
        const conflits = await this.constructor.verifierConflits(
            this.ressource,
            this.debut,
            this.fin,
            this._id
        );

        if (conflits.length > 0) {
            throw new Error('Conflit avec d\'autres allocations');
        }
    }
    next();
});

module.exports = mongoose.model('AllocationRessource', allocationRessourceSchema); 