const mongoose = require('mongoose');
const DocumentBase = require('./DocumentBase');

const documentProjetSchema = new mongoose.Schema({
    projet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Projet',
        required: [true, 'Le projet est requis']
    },
    categorie: {
        type: String,
        enum: {
            values: ['contrat', 'specification', 'rapport', 'presentation', 'autre'],
            message: 'Catégorie de document non valide'
        },
        default: 'autre'
    },
    statut: {
        type: String,
        enum: {
            values: ['brouillon', 'en_revision', 'approuve', 'archive'],
            message: 'Statut de document non valide'
        },
        default: 'brouillon'
    },
    approbations: [{
        approbateur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        statut: {
            type: String,
            enum: ['en_attente', 'approuve', 'rejete'],
            default: 'en_attente'
        },
        commentaire: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    versionDocument: {
        type: String,
        required: true,
        default: '1.0'
    },
    dateExpiration: {
        type: Date
    },
    confidentialite: {
        type: String,
        enum: {
            values: ['public', 'interne', 'confidentiel', 'strictement_confidentiel'],
            message: 'Niveau de confidentialité non valide'
        },
        default: 'interne'
    },
    motsCles: [{
        type: String,
        trim: true
    }],
    references: [{
        type: String,
        trim: true
    }],
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
documentProjetSchema.index({ projet: 1 });
documentProjetSchema.index({ categorie: 1 });
documentProjetSchema.index({ statut: 1 });
documentProjetSchema.index({ confidentialite: 1 });
documentProjetSchema.index({ dateExpiration: 1 });

// Méthode pour ajouter une approbation
documentProjetSchema.methods.ajouterApprobation = async function(approbateurId, statut, commentaire) {
    this.approbations.push({
        approbateur: approbateurId,
        statut,
        commentaire,
        date: new Date()
    });

    // Mettre à jour le statut global si nécessaire
    if (statut === 'rejete') {
        this.statut = 'en_revision';
    } else if (statut === 'approuve' && this.approbations.every(a => a.statut === 'approuve')) {
        this.statut = 'approuve';
    }

    return this.save();
};

// Méthode pour vérifier si le document est expiré
documentProjetSchema.methods.estExpire = function() {
    if (!this.dateExpiration) return false;
    return new Date() > this.dateExpiration;
};

// Méthode pour incrémenter la version
documentProjetSchema.methods.incrementerVersion = function() {
    const [major, minor] = this.versionDocument.split('.').map(Number);
    this.versionDocument = `${major}.${minor + 1}`;
    return this.save();
};

// Méthode pour vérifier les permissions d'accès
documentProjetSchema.methods.verifierAcces = function(user) {
    if (this.confidentialite === 'public') return true;
    if (user.role === 'admin') return true;
    if (this.confidentialite === 'interne' && user.role !== 'user') return true;
    
    // Vérifier si l'utilisateur est impliqué dans le projet
    return this.projet.membres.includes(user._id) || 
           this.projet.responsable.toString() === user._id.toString();
};

// Middleware pour gérer les versions
documentProjetSchema.pre('save', function(next) {
    if (this.isModified('filePath') && !this.isNew) {
        this.incrementerVersion();
    }
    next();
});

// Créer le modèle en utilisant la discrimination
const DocumentProjet = DocumentBase.discriminator('DocumentProjet', documentProjetSchema);

module.exports = DocumentProjet; 