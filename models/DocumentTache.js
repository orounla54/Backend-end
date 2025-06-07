const mongoose = require('mongoose');
const DocumentBase = require('./DocumentBase');

const documentTacheSchema = new mongoose.Schema({
    tache: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tache',
        required: [true, 'La tâche est requise']
    },
    type: {
        type: String,
        enum: {
            values: ['deliverable', 'documentation', 'rapport', 'preuve', 'autre'],
            message: 'Type de document non valide'
        },
        default: 'autre'
    },
    statut: {
        type: String,
        enum: {
            values: ['brouillon', 'en_revision', 'valide', 'archive'],
            message: 'Statut de document non valide'
        },
        default: 'brouillon'
    },
    validations: [{
        validateur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        statut: {
            type: String,
            enum: ['en_attente', 'valide', 'rejete'],
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
    dateLimite: {
        type: Date
    },
    confidentialite: {
        type: String,
        enum: {
            values: ['public', 'interne', 'confidentiel'],
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
documentTacheSchema.index({ tache: 1 });
documentTacheSchema.index({ type: 1 });
documentTacheSchema.index({ statut: 1 });
documentTacheSchema.index({ confidentialite: 1 });
documentTacheSchema.index({ dateLimite: 1 });

// Méthode pour ajouter une validation
documentTacheSchema.methods.ajouterValidation = async function(validateurId, statut, commentaire) {
    this.validations.push({
        validateur: validateurId,
        statut,
        commentaire,
        date: new Date()
    });

    // Mettre à jour le statut global si nécessaire
    if (statut === 'rejete') {
        this.statut = 'en_revision';
    } else if (statut === 'valide' && this.validations.every(v => v.statut === 'valide')) {
        this.statut = 'valide';
    }

    return this.save();
};

// Méthode pour vérifier si le document est en retard
documentTacheSchema.methods.estEnRetard = function() {
    if (!this.dateLimite) return false;
    return new Date() > this.dateLimite;
};

// Méthode pour incrémenter la version
documentTacheSchema.methods.incrementerVersion = function() {
    const [major, minor] = this.versionDocument.split('.').map(Number);
    this.versionDocument = `${major}.${minor + 1}`;
    return this.save();
};

// Méthode pour vérifier les permissions d'accès
documentTacheSchema.methods.verifierAcces = function(user) {
    if (this.confidentialite === 'public') return true;
    if (user.role === 'admin') return true;
    if (this.confidentialite === 'interne' && user.role !== 'user') return true;
    
    // Vérifier si l'utilisateur est impliqué dans la tâche
    return this.tache.responsable.toString() === user._id.toString() ||
           this.tache.projet.membres.includes(user._id) ||
           this.tache.projet.responsable.toString() === user._id.toString();
};

// Middleware pour gérer les versions
documentTacheSchema.pre('save', function(next) {
    if (this.isModified('filePath') && !this.isNew) {
        this.incrementerVersion();
    }
    next();
});

// Créer le modèle en utilisant la discrimination
const DocumentTache = DocumentBase.discriminator('DocumentTache', documentTacheSchema);

module.exports = DocumentTache; 