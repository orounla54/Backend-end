const mongoose = require('mongoose');
const MediaBase = require('./MediaBase');

const imageProjetSchema = new mongoose.Schema({
    projet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Projet',
        required: [true, 'Le projet est requis']
    },
    type: {
        type: String,
        enum: {
            values: ['logo', 'banniere', 'capture', 'diagramme', 'autre'],
            message: 'Type d\'image non valide'
        },
        default: 'autre'
    },
    description: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    confidentialite: {
        type: String,
        enum: {
            values: ['public', 'interne', 'confidentiel'],
            message: 'Niveau de confidentialité non valide'
        },
        default: 'interne'
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
imageProjetSchema.index({ projet: 1 });
imageProjetSchema.index({ type: 1 });
imageProjetSchema.index({ confidentialite: 1 });
imageProjetSchema.index({ tags: 1 });

// Méthode pour vérifier les permissions d'accès
imageProjetSchema.methods.verifierAcces = function(user) {
    if (this.confidentialite === 'public') return true;
    if (user.role === 'admin') return true;
    if (this.confidentialite === 'interne' && user.role !== 'user') return true;
    
    // Vérifier si l'utilisateur est impliqué dans le projet
    return this.projet.membres.includes(user._id) || 
           this.projet.responsable.toString() === user._id.toString();
};

// Créer le modèle en utilisant la discrimination
const ImageProjet = MediaBase.discriminator('ImageProjet', imageProjetSchema);

module.exports = ImageProjet; 