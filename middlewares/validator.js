const { AppError } = require('./error');

// Middleware de validation des données
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessage = error.details
                .map(detail => detail.message)
                .join(', ');
            return next(new AppError(errorMessage, 400));
        }

        next();
    };
};

// Middleware de validation des paramètres
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessage = error.details
                .map(detail => detail.message)
                .join(', ');
            return next(new AppError(errorMessage, 400));
        }

        next();
    };
};

// Middleware de validation des requêtes
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessage = error.details
                .map(detail => detail.message)
                .join(', ');
            return next(new AppError(errorMessage, 400));
        }

        next();
    };
};

// Middleware de validation des fichiers
const validateFile = (options = {}) => {
    return (req, res, next) => {
        if (!req.file && options.required) {
            return next(new AppError('Aucun fichier n\'a été téléchargé', 400));
        }

        if (req.file) {
            const { mimetype, size } = req.file;

            if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(mimetype)) {
                return next(new AppError('Type de fichier non autorisé', 400));
            }

            if (options.maxSize && size > options.maxSize) {
                return next(new AppError('Fichier trop volumineux', 400));
            }
        }

        next();
    };
};

module.exports = {
    validate,
    validateParams,
    validateQuery,
    validateFile
}; 