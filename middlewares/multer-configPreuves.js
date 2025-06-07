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
        const destination = path.join(__dirname, '../public/preuves');
        createDestination(destination);
        cb(null, destination);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Filtre pour les types de fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté. Types acceptés : PDF, Word, Excel, Images'), false);
    }
};

// Configuration de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10 // Maximum 10 fichiers
    }
});

// Middleware pour traiter les fichiers uploadés
const processFiles = (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier n\'a été uploadé'
            });
        }

        // Ajouter les informations des fichiers à la requête
        req.uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        }));

        logger.info('Fichiers uploadés avec succès', {
            userId: req.user?.id,
            fileCount: req.files.length,
            files: req.files.map(f => f.filename)
        });

        next();
    } catch (error) {
        logger.error('Erreur lors du traitement des fichiers', {
            error: error.message,
            userId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: 'Erreur lors du traitement des fichiers',
            error: error.message
        });
    }
};

module.exports = {
    upload,
    processFiles
}; 