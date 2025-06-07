const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: [true, 'Le titre est requis'],
        trim: true,
        minlength: [3, 'Le titre doit contenir au moins 3 caractères'],
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description est requise'],
        trim: true,
        minlength: [10, 'La description doit contenir au moins 10 caractères']
    },
    dateDebut: {
        type: Date,
        required: [true, 'La date de début est requise'],
        validate: {
            validator: function(v) {
                return v instanceof Date && !isNaN(v);
            },
            message: 'La date de début doit être une date valide'
        }
    },
    dateFin: {
        type: Date,
        required: [true, 'La date de fin est requise'],
        validate: [
            {
                validator: function(v) {
                    return v instanceof Date && !isNaN(v);
                },
                message: 'La date de fin doit être une date valide'
            },
            {
                validator: function(v) {
                    return v > this.dateDebut;
                },
                message: 'La date de fin doit être postérieure à la date de début'
            }
        ]
    },
    statut: {
        type: String,
        enum: {
            values: ['en_cours', 'termine', 'en_attente'],
            message: 'Le statut doit être en_cours, termine ou en_attente'
        },
        default: 'en_attente'
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le responsable est requis'],
        validate: {
            validator: async function(v) {
                const User = mongoose.model('User');
                const user = await User.findById(v);
                return user && user.role === 'responsable';
            },
            message: 'Le responsable doit être un utilisateur avec le rôle responsable'
        }
    },
    membres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    taches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tache'
    }],
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DocumentProjet'
    }],
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImageProjet'
    }],
    budget: {
        type: Number,
        min: [0, 'Le budget ne peut pas être négatif']
    },
    priorite: {
        type: String,
        enum: {
            values: ['basse', 'moyenne', 'haute'],
            message: 'La priorité doit être basse, moyenne ou haute'
        },
        default: 'moyenne'
    },
    progression: {
        type: Number,
        min: [0, 'La progression ne peut pas être négative'],
        max: [100, 'La progression ne peut pas dépasser 100%'],
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    commentaires: [{
        auteur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        contenu: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index pour améliorer les performances des requêtes
projetSchema.index({ titre: 'text', description: 'text' });
projetSchema.index({ statut: 1 });
projetSchema.index({ responsable: 1 });
projetSchema.index({ dateDebut: 1, dateFin: 1 });

// Méthode virtuelle pour calculer la progression
projetSchema.virtual('progressionCalculee').get(async function() {
    if (!this.taches || this.taches.length === 0) return 0;
    
    const Tache = mongoose.model('Tache');
    const taches = await Tache.find({ _id: { $in: this.taches } });
    
    if (taches.length === 0) return 0;
    
    const tachesTerminees = taches.filter(tache => tache.statut === 'terminee').length;
    return Math.round((tachesTerminees / taches.length) * 100);
});

// Middleware pour mettre à jour la progression avant la sauvegarde
projetSchema.pre('save', async function(next) {
    if (this.isModified('taches')) {
        this.progression = await this.progressionCalculee;
    }
    next();
});

// Méthode pour ajouter un commentaire
projetSchema.methods.ajouterCommentaire = async function(auteurId, contenu) {
    this.commentaires.push({
        auteur: auteurId,
        contenu: contenu
    });
    return this.save();
};

// Méthode pour vérifier si le projet est en retard
projetSchema.methods.estEnRetard = function() {
    return this.statut === 'en_cours' && new Date() > this.dateFin;
};

// Méthode pour calculer le temps restant
projetSchema.methods.tempsRestant = function() {
    if (this.statut === 'termine') return 0;
    const maintenant = new Date();
    const fin = new Date(this.dateFin);
    return Math.max(0, fin - maintenant);
};

module.exports = mongoose.model('Projet', projetSchema); 