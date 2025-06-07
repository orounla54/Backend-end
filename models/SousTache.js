const mongoose = require('mongoose');

const sousTacheSchema = new mongoose.Schema({
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
            values: ['en_cours', 'terminee', 'en_attente'],
            message: 'Le statut doit être en_cours, terminee ou en_attente'
        },
        default: 'en_attente'
    },
    priorite: {
        type: String,
        enum: {
            values: ['basse', 'moyenne', 'haute'],
            message: 'La priorité doit être basse, moyenne ou haute'
        },
        default: 'moyenne'
    },
    important: {
        type: Boolean,
        default: false
    },
    urgent: {
        type: Boolean,
        default: false
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le responsable est requis'],
        validate: {
            validator: async function(v) {
                const User = mongoose.model('User');
                const user = await User.findById(v);
                return user && (user.role === 'responsable' || user.role === 'user');
            },
            message: 'Le responsable doit être un utilisateur valide'
        }
    },
    tache: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tache',
        required: [true, 'La tâche parente est requise']
    },
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DocumentTache'
    }],
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImageTache'
    }],
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
    }],
    dependances: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SousTache'
    }],
    tempsEstime: {
        type: Number, // en heures
        min: [0, 'Le temps estimé ne peut pas être négatif']
    },
    tempsReel: {
        type: Number, // en heures
        min: [0, 'Le temps réel ne peut pas être négatif']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index pour améliorer les performances des requêtes
sousTacheSchema.index({ titre: 'text', description: 'text' });
sousTacheSchema.index({ statut: 1 });
sousTacheSchema.index({ responsable: 1 });
sousTacheSchema.index({ tache: 1 });
sousTacheSchema.index({ dateDebut: 1, dateFin: 1 });

// Méthode pour ajouter un commentaire
sousTacheSchema.methods.ajouterCommentaire = async function(auteurId, contenu) {
    this.commentaires.push({
        auteur: auteurId,
        contenu: contenu
    });
    return this.save();
};

// Méthode pour vérifier si la sous-tâche est en retard
sousTacheSchema.methods.estEnRetard = function() {
    return this.statut === 'en_cours' && new Date() > this.dateFin;
};

// Méthode pour calculer le temps restant
sousTacheSchema.methods.tempsRestant = function() {
    if (this.statut === 'terminee') return 0;
    const maintenant = new Date();
    const fin = new Date(this.dateFin);
    return Math.max(0, fin - maintenant);
};

// Méthode pour vérifier les dépendances
sousTacheSchema.methods.verifierDependances = async function() {
    if (!this.dependances || this.dependances.length === 0) return true;
    
    const SousTache = mongoose.model('SousTache');
    const dependances = await SousTache.find({ _id: { $in: this.dependances } });
    return dependances.every(d => d.statut === 'terminee');
};

module.exports = mongoose.model('SousTache', sousTacheSchema); 