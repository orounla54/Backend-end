const mongoose = require('mongoose');

const tacheSchema = new mongoose.Schema({
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
    projet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Projet',
        required: [true, 'Le projet est requis']
    },
    sousTaches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SousTache'
    }],
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
    typeTache: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypeTache'
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
        ref: 'Tache'
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
tacheSchema.index({ titre: 'text', description: 'text' });
tacheSchema.index({ statut: 1 });
tacheSchema.index({ responsable: 1 });
tacheSchema.index({ projet: 1 });
tacheSchema.index({ dateDebut: 1, dateFin: 1 });

// Méthode virtuelle pour calculer la progression
tacheSchema.virtual('progressionCalculee').get(async function() {
    if (!this.sousTaches || this.sousTaches.length === 0) return this.progression;
    
    const SousTache = mongoose.model('SousTache');
    const sousTaches = await SousTache.find({ _id: { $in: this.sousTaches } });
    
    if (sousTaches.length === 0) return this.progression;
    
    const sousTachesTerminees = sousTaches.filter(st => st.statut === 'terminee').length;
    return Math.round((sousTachesTerminees / sousTaches.length) * 100);
});

// Middleware pour mettre à jour la progression avant la sauvegarde
tacheSchema.pre('save', async function(next) {
    if (this.isModified('sousTaches') || this.isModified('progression')) {
        this.progression = await this.progressionCalculee;
    }
    next();
});

// Méthode pour ajouter un commentaire
tacheSchema.methods.ajouterCommentaire = async function(auteurId, contenu) {
    this.commentaires.push({
        auteur: auteurId,
        contenu: contenu
    });
    return this.save();
};

// Méthode pour vérifier si la tâche est en retard
tacheSchema.methods.estEnRetard = function() {
    return this.statut === 'en_cours' && new Date() > this.dateFin;
};

// Méthode pour calculer le temps restant
tacheSchema.methods.tempsRestant = function() {
    if (this.statut === 'terminee') return 0;
    const maintenant = new Date();
    const fin = new Date(this.dateFin);
    return Math.max(0, fin - maintenant);
};

// Méthode pour vérifier les dépendances
tacheSchema.methods.verifierDependances = async function() {
    if (!this.dependances || this.dependances.length === 0) return true;
    
    const Tache = mongoose.model('Tache');
    const dependances = await Tache.find({ _id: { $in: this.dependances } });
    
    return dependances.every(dep => dep.statut === 'terminee');
};

// Méthode pour calculer l'efficacité
tacheSchema.methods.calculerEfficacite = function() {
    if (!this.tempsEstime || !this.tempsReel) return null;
    return (this.tempsEstime / this.tempsReel) * 100;
};

module.exports = mongoose.model('Tache', tacheSchema); 