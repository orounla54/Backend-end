const mongoose = require('mongoose');

const objectifStrategiqueSchema = new mongoose.Schema({
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
    code: {
        type: String,
        required: [true, 'Le code est requis'],
        unique: true,
        trim: true,
        uppercase: true,
        match: [/^[A-Z]{2,3}\d{3}$/, 'Le code doit contenir 2 à 3 lettres majuscules suivies de 3 chiffres']
    },
    axeStrategique: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AxeStrategique',
        required: [true, 'L\'axe stratégique est requis']
    },
    priorite: {
        type: String,
        enum: {
            values: ['basse', 'moyenne', 'haute', 'critique'],
            message: 'Priorité non valide'
        },
        default: 'moyenne'
    },
    statut: {
        type: String,
        enum: {
            values: ['planifie', 'en_cours', 'termine', 'suspendu'],
            message: 'Statut non valide'
        },
        default: 'planifie'
    },
    dateDebut: {
        type: Date,
        required: [true, 'La date de début est requise'],
        validate: {
            validator: function(v) {
                return v instanceof Date && !isNaN(v);
            },
            message: 'Date de début invalide'
        }
    },
    dateFin: {
        type: Date,
        required: [true, 'La date de fin est requise'],
        validate: {
            validator: function(v) {
                return v instanceof Date && !isNaN(v) && v > this.dateDebut;
            },
            message: 'La date de fin doit être postérieure à la date de début'
        }
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le responsable est requis']
    },
    membres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    progression: {
        type: Number,
        min: [0, 'La progression ne peut pas être négative'],
        max: [100, 'La progression ne peut pas dépasser 100'],
        default: 0
    },
    budget: {
        prevu: {
            type: Number,
            min: [0, 'Le budget prévu ne peut pas être négatif']
        },
        realise: {
            type: Number,
            min: [0, 'Le budget réalisé ne peut pas être négatif']
        }
    },
    indicateurs: [{
        nom: {
            type: String,
            required: true,
            trim: true
        },
        description: String,
        unite: String,
        valeurCible: Number,
        valeurActuelle: Number,
        dateMesure: Date
    }],
    livrables: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DocumentProjet'
    }],
    commentaires: [{
        auteur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        contenu: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
objectifStrategiqueSchema.index({ code: 1 }, { unique: true });
objectifStrategiqueSchema.index({ titre: 'text', description: 'text' });
objectifStrategiqueSchema.index({ axeStrategique: 1 });
objectifStrategiqueSchema.index({ statut: 1 });
objectifStrategiqueSchema.index({ priorite: 1 });
objectifStrategiqueSchema.index({ responsable: 1 });
objectifStrategiqueSchema.index({ dateDebut: 1, dateFin: 1 });
objectifStrategiqueSchema.index({ tags: 1 });

// Méthode pour vérifier si l'objectif est en retard
objectifStrategiqueSchema.methods.estEnRetard = function() {
    if (this.statut === 'termine') return false;
    return new Date() > this.dateFin;
};

// Méthode pour ajouter un commentaire
objectifStrategiqueSchema.methods.ajouterCommentaire = function(auteurId, contenu) {
    this.commentaires.push({
        auteur: auteurId,
        contenu,
        date: new Date()
    });
    return this.save();
};

// Méthode pour mettre à jour un indicateur
objectifStrategiqueSchema.methods.mettreAJourIndicateur = function(nom, valeur, date) {
    const indicateur = this.indicateurs.find(i => i.nom === nom);
    if (indicateur) {
        indicateur.valeurActuelle = valeur;
        indicateur.dateMesure = date || new Date();
    }
    return this.save();
};

// Méthode pour mettre à jour la progression
objectifStrategiqueSchema.methods.mettreAJourProgression = function(nouvelleProgression) {
    if (nouvelleProgression >= 0 && nouvelleProgression <= 100) {
        this.progression = nouvelleProgression;
        if (nouvelleProgression === 100) {
            this.statut = 'termine';
        } else if (this.statut === 'planifie') {
            this.statut = 'en_cours';
        }
        return this.save();
    }
    throw new Error('La progression doit être comprise entre 0 et 100');
};

// Middleware pour mettre à jour le statut avant la sauvegarde
objectifStrategiqueSchema.pre('save', function(next) {
    const now = new Date();
    
    if (this.statut === 'en_cours' && now > this.dateFin) {
        this.statut = 'suspendu';
    }
    
    next();
});

module.exports = mongoose.model('ObjectifStrategique', objectifStrategiqueSchema); 