const mongoose = require('mongoose');

const tableauBordSchema = new mongoose.Schema({
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
            values: ['personnel', 'equipe', 'projet', 'organisation'],
            message: 'Type de tableau de bord non valide'
        },
        required: [true, 'Le type est requis']
    },
    createur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le créateur est requis']
    },
    layout: {
        type: {
            type: String,
            enum: ['grille', 'libre'],
            default: 'grille'
        },
        colonnes: {
            type: Number,
            min: [1, 'Le nombre de colonnes doit être supérieur à 0'],
            max: [12, 'Le nombre de colonnes ne peut pas dépasser 12'],
            default: 3
        },
        espacement: {
            type: Number,
            min: [0, 'L\'espacement ne peut pas être négatif'],
            default: 16
        }
    },
    widgets: [{
        type: {
            type: String,
            enum: [
                'graphique', 'tableau', 'indicateur', 'liste', 
                'calendrier', 'carte', 'texte', 'lien'
            ],
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
            x: {
                type: Number,
                required: true,
                min: 0
            },
            y: {
                type: Number,
                required: true,
                min: 0
            },
            largeur: {
                type: Number,
                required: true,
                min: 1,
                max: 12
            },
            hauteur: {
                type: Number,
                required: true,
                min: 1
            }
        },
        actualisation: {
            active: {
                type: Boolean,
                default: false
            },
            intervalle: {
                type: Number,
                min: [30, 'L\'intervalle minimum est de 30 secondes'],
                default: 300
            }
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
        }]
    }],
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
        theme: {
            type: String,
            enum: ['clair', 'sombre', 'systeme'],
            default: 'systeme'
        }
    },
    partage: [{
        utilisateur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        permissions: [{
            type: String,
            enum: ['lecture', 'modification', 'suppression', 'partage'],
            required: true
        }],
        dateAjout: {
            type: Date,
            default: Date.now
        }
    }],
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
tableauBordSchema.index({ titre: 'text', description: 'text' });
tableauBordSchema.index({ type: 1 });
tableauBordSchema.index({ createur: 1 });
tableauBordSchema.index({ 'partage.utilisateur': 1 });

// Méthode pour ajouter un widget
tableauBordSchema.methods.ajouterWidget = function(type, titre, configuration, position, actualisation, filtres) {
    this.widgets.push({
        type,
        titre,
        configuration,
        position,
        actualisation,
        filtres
    });
    return this.save();
};

// Méthode pour mettre à jour un widget
tableauBordSchema.methods.mettreAJourWidget = function(widgetId, updates) {
    const widget = this.widgets.id(widgetId);
    if (widget) {
        Object.assign(widget, updates);
        return this.save();
    }
    throw new Error('Widget non trouvé');
};

// Méthode pour supprimer un widget
tableauBordSchema.methods.supprimerWidget = function(widgetId) {
    this.widgets = this.widgets.filter(w => w._id.toString() !== widgetId.toString());
    return this.save();
};

// Méthode pour réorganiser les widgets
tableauBordSchema.methods.reorganiserWidgets = function(nouveauxPositions) {
    nouveauxPositions.forEach(({ widgetId, position }) => {
        const widget = this.widgets.id(widgetId);
        if (widget) {
            widget.position = position;
        }
    });
    return this.save();
};

// Méthode pour partager le tableau de bord
tableauBordSchema.methods.partager = function(utilisateurId, permissions) {
    if (!this.partage.some(p => p.utilisateur.toString() === utilisateurId.toString())) {
        this.partage.push({
            utilisateur: utilisateurId,
            permissions,
            dateAjout: new Date()
        });
        return this.save();
    }
    throw new Error('Le tableau de bord est déjà partagé avec cet utilisateur');
};

// Méthode pour ajouter une entrée dans l'historique
tableauBordSchema.methods.ajouterHistorique = function(utilisateurId, action, details = {}) {
    this.historique.push({
        date: new Date(),
        utilisateur: utilisateurId,
        action,
        details
    });
    return this.save();
};

// Méthode pour actualiser les données des widgets
tableauBordSchema.methods.actualiserWidgets = async function() {
    const widgetsAActualiser = this.widgets.filter(w => w.actualisation.active);
    
    for (const widget of widgetsAActualiser) {
        try {
            const donnees = await this.recupererDonneesWidget(widget);
            widget.configuration.set('donnees', donnees);
        } catch (error) {
            console.error(`Erreur lors de l'actualisation du widget ${widget._id}:`, error);
        }
    }
    
    return this.save();
};

// Middleware pour mettre à jour la version lors des modifications
tableauBordSchema.pre('save', function(next) {
    if (this.isModified('widgets') || this.isModified('parametres')) {
        const versionParts = this.version.split('.');
        versionParts[1] = parseInt(versionParts[1]) + 1;
        this.version = versionParts.join('.');
    }
    next();
});

module.exports = mongoose.model('TableauBord', tableauBordSchema); 