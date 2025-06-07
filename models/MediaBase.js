const mongoose = require('mongoose');

const mediaBaseSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: [true, 'Le nom du fichier est requis'],
        trim: true
    },
    filePath: {
        type: String,
        required: [true, 'Le chemin du fichier est requis'],
        trim: true
    },
    mimeType: {
        type: String,
        required: [true, 'Le type MIME est requis']
    },
    size: {
        type: Number,
        required: [true, 'La taille du fichier est requise'],
        min: [0, 'La taille ne peut pas être négative']
    },
    dimensions: {
        width: Number,
        height: Number
    },
    duration: Number, // Pour les fichiers audio/vidéo
    thumbnail: {
        path: String,
        width: Number,
        height: Number
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur qui a uploadé le fichier est requis']
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    discriminatorKey: 'mediaType'
});

// Index pour améliorer les performances des requêtes
mediaBaseSchema.index({ fileName: 'text' });
mediaBaseSchema.index({ uploadedBy: 1 });
mediaBaseSchema.index({ isPublic: 1 });

// Méthode pour obtenir l'URL du fichier
mediaBaseSchema.methods.getFileUrl = function() {
    return `/uploads/${this.filePath}`;
};

// Méthode pour obtenir l'URL de la miniature
mediaBaseSchema.methods.getThumbnailUrl = function() {
    return this.thumbnail ? `/uploads/${this.thumbnail.path}` : null;
};

// Méthode pour vérifier si le fichier est accessible par un utilisateur
mediaBaseSchema.methods.isAccessibleBy = function(user) {
    if (this.isPublic) return true;
    if (user.role === 'admin') return true;
    return this.uploadedBy.toString() === user._id.toString();
};

// Middleware pour nettoyer les fichiers physiques lors de la suppression
mediaBaseSchema.pre('remove', async function(next) {
    try {
        const fs = require('fs');
        const path = require('path');
        
        // Supprimer le fichier principal
        const filePath = path.join(process.cwd(), 'uploads', this.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Supprimer la miniature si elle existe
        if (this.thumbnail && this.thumbnail.path) {
            const thumbnailPath = path.join(process.cwd(), 'uploads', this.thumbnail.path);
            if (fs.existsSync(thumbnailPath)) {
                fs.unlinkSync(thumbnailPath);
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('MediaBase', mediaBaseSchema); 