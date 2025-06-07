const mongoose = require('mongoose');

const ressourceSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Le code est requis'],
        unique: true,
        trim: true,
        match: [/^[A-Z]{2,3}\d{3}$/, 'Format de code invalide (2-3 lettres majuscules suivies de 3 chiffres)']
    },
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
            values: ['humaine', 'materielle', 'financiere', 'technologique'],
            message: 'Type de ressource non valide'
        },
        required: [true, 'Le type est requis']
    },
    categorie: {
        type: String,
        required: [true, 'La catégorie est requise'],
        trim: true
    },
    statut: {
        type: String,
        enum: {
            values: ['disponible', 'occupe', 'maintenance', 'inactif'],
            message: 'Statut non valide'
        },
        default: 'disponible'
    },
    disponibilite: {
        debut: Date,
        fin: Date,
        horaires: [{
            jour: {
                type: String,
                enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
            },
            debut: String,
            fin: String
        }]
    },
    cout: {
        montant: {
            type: Number,
            min: [0, 'Le montant ne peut pas être négatif']
        },
        devise: {
            type: String,
            default: 'EUR'
        },
        periode: {
            type: String,
            enum: ['heure', 'jour', 'semaine', 'mois', 'an'],
            default: 'heure'
        }
    },
    caracteristiques: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    competences: [{
        nom: {
            type: String,
            required: true
        },
        niveau: {
            type: Number,
            min: 1,
            max: 5
        },
        certification: Boolean
    }],
    affectations: [{
        projet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Projet',
            required: true
        },
        tache: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tache'
        },
        debut: {
            type: Date,
            required: true
        },
        fin: {
            type: Date,
            required: true
        },
        charge: {
            type: Number,
            min: 0,
            max: 100,
            default: 100
        },
        statut: {
            type: String,
            enum: ['planifie', 'en_cours', 'termine', 'annule'],
            default: 'planifie'
        }
    }],
    documents: [{
        type: {
            type: String,
            required: true
        },
        nom: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
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
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
ressourceSchema.index({ code: 1 }, { unique: true });
ressourceSchema.index({ titre: 'text', description: 'text' });
ressourceSchema.index({ type: 1, categorie: 1 });
ressourceSchema.index({ statut: 1 });
ressourceSchema.index({ 'affectations.projet': 1 });
ressourceSchema.index({ 'affectations.tache': 1 });
ressourceSchema.index({ responsable: 1 });

// Méthode pour vérifier la disponibilité
ressourceSchema.methods.verifierDisponibilite = function(debut, fin) {
    if (this.statut !== 'disponible') {
        return false;
    }

    // Vérifier les horaires de disponibilité
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);
    
    // Vérifier les affectations existantes
    const conflits = this.affectations.filter(affectation => {
        return (
            (dateDebut >= affectation.debut && dateDebut < affectation.fin) ||
            (dateFin > affectation.debut && dateFin <= affectation.fin) ||
            (dateDebut <= affectation.debut && dateFin >= affectation.fin)
        );
    });

    return conflits.length === 0;
};

// Méthode pour ajouter une affectation
ressourceSchema.methods.ajouterAffectation = function(projet, tache, debut, fin, charge = 100) {
    if (!this.verifierDisponibilite(debut, fin)) {
        throw new Error('La ressource n\'est pas disponible sur cette période');
    }

    this.affectations.push({
        projet,
        tache,
        debut,
        fin,
        charge,
        statut: 'planifie'
    });

    return this.save();
};

// Méthode pour mettre à jour une affectation
ressourceSchema.methods.mettreAJourAffectation = function(affectationId, updates) {
    const affectation = this.affectations.id(affectationId);
    if (!affectation) {
        throw new Error('Affectation non trouvée');
    }

    // Vérifier la disponibilité si les dates sont modifiées
    if (updates.debut || updates.fin) {
        const debut = updates.debut || affectation.debut;
        const fin = updates.fin || affectation.fin;
        
        // Exclure l'affectation actuelle de la vérification
        const autresAffectations = this.affectations.filter(a => a._id.toString() !== affectationId);
        const conflits = autresAffectations.filter(a => {
            return (
                (debut >= a.debut && debut < a.fin) ||
                (fin > a.debut && fin <= a.fin) ||
                (debut <= a.debut && fin >= a.fin)
            );
        });

        if (conflits.length > 0) {
            throw new Error('Conflit avec d\'autres affectations');
        }
    }

    Object.assign(affectation, updates);
    return this.save();
};

// Méthode pour calculer la charge de travail
ressourceSchema.methods.calculerCharge = function(debut, fin) {
    const affectations = this.affectations.filter(a => {
        return (
            (debut >= a.debut && debut < a.fin) ||
            (fin > a.debut && fin <= a.fin) ||
            (debut <= a.debut && fin >= a.fin)
        );
    });

    return affectations.reduce((total, a) => total + a.charge, 0);
};

// Méthode pour ajouter un document
ressourceSchema.methods.ajouterDocument = function(type, nom, url) {
    this.documents.push({
        type,
        nom,
        url,
        dateAjout: new Date()
    });
    return this.save();
};

// Méthode pour ajouter une entrée dans l'historique
ressourceSchema.methods.ajouterHistorique = function(action, utilisateurId, details = {}) {
    this.historique.push({
        date: new Date(),
        action,
        utilisateur: utilisateurId,
        details
    });
    return this.save();
};

// Middleware pour mettre à jour le statut en fonction des affectations
ressourceSchema.pre('save', function(next) {
    if (this.isModified('affectations')) {
        const maintenant = new Date();
        const affectationsActives = this.affectations.filter(a => 
            a.statut === 'en_cours' && 
            maintenant >= a.debut && 
            maintenant <= a.fin
        );

        this.statut = affectationsActives.length > 0 ? 'occupe' : 'disponible';
    }
    next();
});

module.exports = mongoose.model('Ressource', ressourceSchema); 