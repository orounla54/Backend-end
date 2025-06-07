const mongoose = require('mongoose');

const planStrategiqueSchema = new mongoose.Schema({
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
        match: [/^PS\d{4}$/, 'Le code doit commencer par PS suivi de 4 chiffres']
    },
    version: {
        type: String,
        required: true,
        default: '1.0'
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
    statut: {
        type: String,
        enum: {
            values: ['brouillon', 'en_cours', 'termine', 'archive'],
            message: 'Statut non valide'
        },
        default: 'brouillon'
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le responsable est requis']
    },
    comite: [{
        membre: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['president', 'membre', 'observateur'],
            default: 'membre'
        },
        dateAjout: {
            type: Date,
            default: Date.now
        }
    }],
    axes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AxeStrategique'
    }],
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
        dateMesure: Date,
        periodicite: {
            type: String,
            enum: ['quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel'],
            default: 'mensuel'
        }
    }],
    documents: [{
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
    historique: [{
        action: {
            type: String,
            required: true
        },
        utilisateur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        details: mongoose.Schema.Types.Mixed
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
planStrategiqueSchema.index({ code: 1 }, { unique: true });
planStrategiqueSchema.index({ titre: 'text', description: 'text' });
planStrategiqueSchema.index({ statut: 1 });
planStrategiqueSchema.index({ responsable: 1 });
planStrategiqueSchema.index({ dateDebut: 1, dateFin: 1 });
planStrategiqueSchema.index({ tags: 1 });

// Méthode pour calculer la progression
planStrategiqueSchema.methods.calculerProgression = async function() {
    const AxeStrategique = mongoose.model('AxeStrategique');
    const axes = await AxeStrategique.find({ _id: { $in: this.axes } });
    
    if (axes.length === 0) return 0;
    
    const progressionTotale = axes.reduce((acc, axe) => acc + (axe.progression || 0), 0);
    return progressionTotale / axes.length;
};

// Méthode pour ajouter un commentaire
planStrategiqueSchema.methods.ajouterCommentaire = function(auteurId, contenu) {
    this.commentaires.push({
        auteur: auteurId,
        contenu,
        date: new Date()
    });
    return this.save();
};

// Méthode pour ajouter une entrée dans l'historique
planStrategiqueSchema.methods.ajouterHistorique = function(action, utilisateurId, details = {}) {
    this.historique.push({
        action,
        utilisateur: utilisateurId,
        date: new Date(),
        details
    });
    return this.save();
};

// Méthode pour mettre à jour un indicateur
planStrategiqueSchema.methods.mettreAJourIndicateur = function(nom, valeur, date) {
    const indicateur = this.indicateurs.find(i => i.nom === nom);
    if (indicateur) {
        indicateur.valeurActuelle = valeur;
        indicateur.dateMesure = date || new Date();
    }
    return this.save();
};

// Méthode pour ajouter un membre au comité
planStrategiqueSchema.methods.ajouterMembreComite = function(utilisateurId, role = 'membre') {
    if (!this.comite.some(m => m.membre.toString() === utilisateurId.toString())) {
        this.comite.push({
            membre: utilisateurId,
            role,
            dateAjout: new Date()
        });
        return this.save();
    }
    throw new Error('L\'utilisateur est déjà membre du comité');
};

// Middleware pour mettre à jour le statut avant la sauvegarde
planStrategiqueSchema.pre('save', function(next) {
    const now = new Date();
    
    if (this.statut === 'en_cours' && now > this.dateFin) {
        this.statut = 'termine';
    }
    
    next();
});

module.exports = mongoose.model('PlanStrategique', planStrategiqueSchema); 