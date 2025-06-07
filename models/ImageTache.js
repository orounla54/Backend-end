const mongoose = require('mongoose');
const MediaBase = require('./MediaBase');

const imageTacheSchema = new mongoose.Schema({
    tache: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tache',
        required: [true, 'La tâche est requise']
    },
    type: {
        type: String,
        enum: {
            values: ['capture', 'preuve', 'diagramme', 'autre'],
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
imageTacheSchema.index({ tache: 1 });
imageTacheSchema.index({ type: 1 });
imageTacheSchema.index({ confidentialite: 1 });
imageTacheSchema.index({ tags: 1 });

// Méthode pour vérifier les permissions d'accès
imageTacheSchema.methods.verifierAcces = function(user) {
    if (this.confidentialite === 'public') return true;
    if (user.role === 'admin') return true;
    if (this.confidentialite === 'interne' && user.role !== 'user') return true;
    
    // Vérifier si l'utilisateur est impliqué dans la tâche
    return this.tache.responsable.toString() === user._id.toString() ||
           this.tache.projet.membres.includes(user._id) ||
           this.tache.projet.responsable.toString() === user._id.toString();
};

// Créer le modèle en utilisant la discrimination
const ImageTache = MediaBase.discriminator('ImageTache', imageTacheSchema);

module.exports = ImageTache; 