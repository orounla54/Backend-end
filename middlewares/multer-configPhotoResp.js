const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { logger } = require('./logger');

// Créer le dossier de destination s'il n'existe pas
const createDestination = (destination) => {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }
};

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const destination = path.join(__dirname, '../public/photos/responsables');
        createDestination(destination);
        cb(null, destination);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'photo-' + uniqueSuffix + ext);
    }
});

// Filtre pour les types de fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté. Types acceptés : JPEG, PNG, GIF'), false);
    }
};

// Configuration de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Maximum 1 fichier
    }
});

// Middleware pour traiter les fichiers uploadés
const processFiles = (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucune photo n\'a été uploadée'
            });
        }

        // Ajouter les informations du fichier à la requête
        req.uploadedFile = {
            filename: req.file.filename,
            originalname: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype
        };

        logger.info('Photo uploadée avec succès', {
            userId: req.user?.id,
            filename: req.file.filename
        });

        next();
    } catch (error) {
        logger.error('Erreur lors du traitement de la photo', {
            error: error.message,
            userId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: 'Erreur lors du traitement de la photo',
            error: error.message
        });
    }
};

module.exports = {
    upload,
    processFiles
}; 