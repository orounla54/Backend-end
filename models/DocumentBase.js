const mongoose = require('mongoose');

const documentBaseSchema = new mongoose.Schema({
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
    fileType: {
        type: String,
        required: [true, 'Le type de fichier est requis'],
        enum: {
            values: ['image', 'document', 'video', 'audio', 'archive'],
            message: 'Type de fichier non valide'
        }
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
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur qui a uploadé le fichier est requis']
    },
    description: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    version: {
        type: Number,
        default: 1
    },
    previousVersions: [{
        fileName: String,
        filePath: String,
        version: Number,
        uploadedAt: Date,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true,
    discriminatorKey: 'documentType'
});

// Index pour améliorer les performances des requêtes
documentBaseSchema.index({ fileName: 'text', description: 'text' });
documentBaseSchema.index({ fileType: 1 });
documentBaseSchema.index({ uploadedBy: 1 });
documentBaseSchema.index({ isPublic: 1 });

// Méthode pour obtenir l'URL du fichier
documentBaseSchema.methods.getFileUrl = function() {
    return `/uploads/${this.filePath}`;
};

// Méthode pour vérifier si le fichier est accessible par un utilisateur
documentBaseSchema.methods.isAccessibleBy = function(user) {
    if (this.isPublic) return true;
    if (user.role === 'admin') return true;
    return this.uploadedBy.toString() === user._id.toString();
};

// Méthode pour ajouter une nouvelle version
documentBaseSchema.methods.addNewVersion = async function(newFileData, userId) {
    this.previousVersions.push({
        fileName: this.fileName,
        filePath: this.filePath,
        version: this.version,
        uploadedAt: this.updatedAt,
        uploadedBy: this.uploadedBy
    });

    this.fileName = newFileData.fileName;
    this.filePath = newFileData.filePath;
    this.size = newFileData.size;
    this.mimeType = newFileData.mimeType;
    this.version += 1;
    this.uploadedBy = userId;

    return this.save();
};

// Middleware pour nettoyer les fichiers physiques lors de la suppression
documentBaseSchema.pre('remove', async function(next) {
    try {
        const fs = require('fs');
        const path = require('path');
        
        // Supprimer le fichier principal
        const filePath = path.join(process.cwd(), 'uploads', this.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Supprimer les versions précédentes
        for (const version of this.previousVersions) {
            const versionPath = path.join(process.cwd(), 'uploads', version.filePath);
            if (fs.existsSync(versionPath)) {
                fs.unlinkSync(versionPath);
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('DocumentBase', documentBaseSchema); 