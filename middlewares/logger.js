const winston = require('winston');
const { format } = winston;
const path = require('path');
const fs = require('fs');
const DailyRotateFile = require('winston-daily-rotate-file');

// Création des dossiers de logs s'ils n'existent pas
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Format personnalisé pour les logs
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

// Format pour la console
const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
    })
);

// Configuration des transports avec rotation quotidienne
const transports = [
    // Log des erreurs avec rotation
    new DailyRotateFile({
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d',
        format: logFormat
    }),
    // Log combiné avec rotation
    new DailyRotateFile({
        filename: path.join(logDir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: logFormat
    }),
    // Log des requêtes avec rotation
    new DailyRotateFile({
        filename: path.join(logDir, 'requests-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: logFormat
    })
];

// Ajouter la console en développement
if (process.env.NODE_ENV !== 'production') {
    transports.push(
        new winston.transports.Console({
            format: consoleFormat
        })
    );
}

// Création du logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports,
    exitOnError: false
});

// Middleware de logging des requêtes avec plus de détails
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    // Log de la requête
    logger.info({
        type: 'request',
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id || 'anonymous',
        body: req.method !== 'GET' ? req.body : undefined,
        query: req.query,
        params: req.params
    });

    // Log de la réponse
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            type: 'response',
            requestId,
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id || 'anonymous',
            contentLength: res.get('content-length')
        });
    });

    next();
};

// Middleware de logging des erreurs avec plus de détails
const errorLogger = (err, req, res, next) => {
    logger.error({
        type: 'error',
        requestId: req.requestId,
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        status: err.statusCode || 500,
        userId: req.user?.id || 'anonymous',
        body: req.method !== 'GET' ? req.body : undefined,
        query: req.query,
        params: req.params
    });

    next(err);
};

// Fonction utilitaire pour le logging avec catégories
const logActivity = (type, data, category = 'general') => {
    logger.info({
        type: 'activity',
        category,
        activityType: type,
        ...data,
        timestamp: new Date().toISOString()
    });
};

// Fonction pour le logging des performances
const logPerformance = (operation, duration, metadata = {}) => {
    logger.info({
        type: 'performance',
        operation,
        duration: `${duration}ms`,
        ...metadata,
        timestamp: new Date().toISOString()
    });
};

// Fonction pour le logging des audits
const logAudit = (action, resource, userId, details = {}) => {
    logger.info({
        type: 'audit',
        action,
        resource,
        userId,
        ...details,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    logger,
    requestLogger,
    errorLogger,
    logActivity,
    logPerformance,
    logAudit
}; 