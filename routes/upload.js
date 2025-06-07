const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { upload, processFiles } = require('../middlewares/multer-configPreuves'); // Utilisation d'une config Multer existante
const { logger } = require('../middlewares/logger');

// Route pour l'upload de fichiers preuves (PDF, images, etc.)
router.post('/preuves', protect, upload.array('preuves'), processFiles, (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier n\'a été uploadé'
            });
        }

        const uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        }));

        logger.info('Fichiers uploadés avec succès', {
            userId: req.user.id,
            fileCount: uploadedFiles.length,
            files: uploadedFiles.map(f => f.filename)
        });

        res.status(200).json({
            success: true,
            message: 'Fichiers uploadés avec succès',
            files: uploadedFiles
        });
    } catch (error) {
        logger.error('Erreur lors de l\'upload des fichiers', {
            error: error.message,
            userId: req.user.id
        });

        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload des fichiers',
            error: error.message
        });
    }
});

module.exports = router; 