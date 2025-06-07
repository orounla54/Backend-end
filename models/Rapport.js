const mongoose = require('mongoose');

const rapportSchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: {
            values: [
                'projet', 'tache', 'ressource', 'budget', 
                'performance', 'risque', 'qualite', 'personnalise'
            ],
            message: 'Type de rapport non valide'
        },
        required: [true, 'Le type est requis']
    },
    createur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le créateur est requis']
    },
    parametres: {
        periode: {
            debut: Date,
            fin: Date
        },
        filtres: [{
            champ: {
                type: String,
                required: true
            },
            operateur: {
                type: String,
                enum: ['egal', 'different', 'contient', 'commence', 'termine', 'superieur', 'inferieur'],
                required: true
            },
            valeur: mongoose.Schema.Types.Mixed
        }],
        groupement: [{
            champ: String,
            ordre: {
                type: String,
                enum: ['asc', 'desc'],
                default: 'asc'
            }
        }],
        tri: [{
            champ: String,
            ordre: {
                type: String,
                enum: ['asc', 'desc'],
                default: 'asc'
            }
        }],
        limite: {
            type: Number,
            min: [1, 'La limite doit être supérieure à 0'],
            default: 100
        }
    },
    visualisations: [{
        type: {
            type: String,
            enum: ['tableau', 'graphique', 'carte', 'indicateur'],
            required: true
        },
        titre: {
            type: String,
            required: true,
            trim: true
        },
        configuration: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            required: true
        },
        position: {
            x: Number,
            y: Number,
            largeur: Number,
            hauteur: Number
        }
    }],
    format: {
        type: String,
        enum: ['pdf', 'excel', 'csv', 'json', 'html'],
        default: 'pdf'
    },
    planification: {
        active: {
            type: Boolean,
            default: false
        },
        frequence: {
            type: String,
            enum: ['quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel'],
            default: 'mensuel'
        },
        jour: {
            type: Number,
            min: 1,
            max: 31
        },
        heure: {
            type: String,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:mm)']
        },
        destinataires: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    historique: [{
        date: {
            type: Date,
            default: Date.now
        },
        utilisateur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        action: {
            type: String,
            required: true
        },
        details: mongoose.Schema.Types.Mixed
    }],
    partage: [{
        utilisateur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        permissions: [{
            type: String,
            enum: ['lecture', 'modification', 'suppression', 'partage']
        }],
        dateAjout: {
            type: Date,
            default: Date.now
        }
    }],
    version: {
        type: String,
        required: true,
        default: '1.0'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
rapportSchema.index({ titre: 'text', description: 'text' });
rapportSchema.index({ type: 1 });
rapportSchema.index({ createur: 1 });
rapportSchema.index({ 'planification.active': 1 });
rapportSchema.index({ 'partage.utilisateur': 1 });

// Méthode pour exécuter le rapport
rapportSchema.methods.executer = async function() {
    // Logique d'exécution du rapport basée sur les paramètres
    const resultats = await this.recupererDonnees();
    return this.formaterResultats(resultats);
};

// Méthode pour récupérer les données
rapportSchema.methods.recupererDonnees = async function() {
    // Logique de récupération des données selon le type de rapport
    switch (this.type) {
        case 'projet':
            return this.recupererDonneesProjet();
        case 'tache':
            return this.recupererDonneesTache();
        case 'ressource':
            return this.recupererDonneesRessource();
        case 'budget':
            return this.recupererDonneesBudget();
        default:
            throw new Error('Type de rapport non supporté');
    }
};

// Méthode pour formater les résultats
rapportSchema.methods.formaterResultats = function(resultats) {
    // Logique de formatage selon le format choisi
    switch (this.format) {
        case 'pdf':
            return this.formaterPDF(resultats);
        case 'excel':
            return this.formaterExcel(resultats);
        case 'csv':
            return this.formaterCSV(resultats);
        case 'json':
            return this.formaterJSON(resultats);
        case 'html':
            return this.formaterHTML(resultats);
        default:
            throw new Error('Format non supporté');
    }
};

// Méthode pour ajouter une visualisation
rapportSchema.methods.ajouterVisualisation = function(type, titre, configuration, position) {
    this.visualisations.push({
        type,
        titre,
        configuration,
        position
    });
    return this.save();
};

// Méthode pour partager le rapport
rapportSchema.methods.partager = function(utilisateurId, permissions) {
    if (!this.partage.some(p => p.utilisateur.toString() === utilisateurId.toString())) {
        this.partage.push({
            utilisateur: utilisateurId,
            permissions,
            dateAjout: new Date()
        });
        return this.save();
    }
    throw new Error('Le rapport est déjà partagé avec cet utilisateur');
};

// Méthode pour planifier l'envoi
rapportSchema.methods.planifierEnvoi = function(frequence, jour, heure, destinataires) {
    this.planification = {
        active: true,
        frequence,
        jour,
        heure,
        destinataires
    };
    return this.save();
};

// Méthode pour ajouter une entrée dans l'historique
rapportSchema.methods.ajouterHistorique = function(utilisateurId, action, details = {}) {
    this.historique.push({
        date: new Date(),
        utilisateur: utilisateurId,
        action,
        details
    });
    return this.save();
};

// Middleware pour mettre à jour la version lors des modifications
rapportSchema.pre('save', function(next) {
    if (this.isModified('parametres') || this.isModified('visualisations')) {
        const versionParts = this.version.split('.');
        versionParts[1] = parseInt(versionParts[1]) + 1;
        this.version = versionParts.join('.');
    }
    next();
});

module.exports = mongoose.model('Rapport', rapportSchema); 