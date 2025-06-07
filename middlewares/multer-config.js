const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { AppError } = require('./error');
const { logger } = require('./logger');

// Configuration de base pour le stockage des fichiers
const createStorage = (destination, useMemory = false) => {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    return useMemory ? multer.memoryStorage() : multer.diskStorage({
        destination: (req, file, cb) => cb(null, destination),
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname).toLowerCase();
            const sanitizedFilename = file.originalname
                .replace(/[^a-zA-Z0-9.-]/g, '_')
                .toLowerCase();
            cb(null, `${sanitizedFilename}-${uniqueSuffix}${ext}`);
        }
    });
};

// Filtres de fichiers avec validation améliorée
const fileFilters = {
    images: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        logger.warn('Tentative d\'upload de fichier non autorisé', {
            filename: file.originalname,
            mimetype: file.mimetype,
            userId: req.user?.id
        });
        cb(new AppError('Seules les images (jpeg, jpg, png, webp) sont autorisées', 400));
    },

    documents: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|xls|xlsx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        logger.warn('Tentative d\'upload de document non autorisé', {
            filename: file.originalname,
            mimetype: file.mimetype,
            userId: req.user?.id
        });
        cb(new AppError('Type de document non autorisé', 400));
    },

    media: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|mp4|mov|avi|mp3|wav/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        logger.warn('Tentative d\'upload de média non autorisé', {
            filename: file.originalname,
            mimetype: file.mimetype,
            userId: req.user?.id
        });
        cb(new AppError('Type de média non autorisé', 400));
    }
};

// Traitement des fichiers avec gestion d'erreurs améliorée
const processFiles = async (files, options) => {
    const { convertToWebP = false, quality = 80, maxWidth = 1920 } = options;
    const processedFiles = [];

    for (const file of files) {
        try {
            if (convertToWebP && file.mimetype.startsWith('image/')) {
                const filename = `image_${Date.now()}_${Math.random().toString(36)}.webp`;
                const outputPath = path.join(options.destination, filename);

                await sharp(file.buffer)
                    .resize(maxWidth, null, { withoutEnlargement: true })
                    .webp({ quality })
                    .toFile(outputPath);

                processedFiles.push({
                    filename,
                    path: outputPath,
                    mimetype: 'image/webp',
                    typeMedia: 'image',
                    size: fs.statSync(outputPath).size
                });
            } else {
                processedFiles.push({
                    filename: file.filename,
                    path: file.path,
                    mimetype: file.mimetype,
                    typeMedia: file.mimetype.split('/')[0],
                    size: file.size
                });
            }
        } catch (error) {
            logger.error('Erreur lors du traitement du fichier', {
                filename: file.originalname,
                error: error.message,
                userId: req.user?.id
            });
            throw new AppError(`Erreur lors du traitement du fichier ${file.originalname}`, 500);
        }
    }

    return processedFiles;
};

// Création de la configuration Multer avec options de sécurité
const createMulterConfig = (options) => {
    const {
        destination,
        fileFilter,
        maxSize = 5 * 1024 * 1024, // 5MB par défaut
        convertToWebP = false,
        quality = 80,
        maxWidth = 1920,
        maxFiles = 5
    } = options;

    const upload = multer({
        storage: createStorage(destination, convertToWebP),
        fileFilter: fileFilters[fileFilter],
        limits: { 
            fileSize: maxSize,
            files: maxFiles
        }
    });

    const processUploadedFiles = async (req, res, next) => {
        if (!req.files?.length) return next();

        try {
            req.files = await processFiles(req.files, {
                destination,
                convertToWebP,
                quality,
                maxWidth
            });

            logger.info('Fichiers traités avec succès', {
                count: req.files.length,
                userId: req.user?.id
            });

            next();
        } catch (error) {
            next(error);
        }
    };

    return { upload, processUploadedFiles };
};

module.exports = createMulterConfig; 