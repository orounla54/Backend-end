require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./utils/swaggerConfig');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { errorHandler } = require('./middlewares/error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

// Importer le router principal
const apiRoutes = require('./routes');

const app = express();

// Connexion à la base de données
connectDB();

// Middleware de parsing (doit être avant les routes)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Compression des réponses
app.use(compression());

// Protection contre les attaques HTTP Parameter Pollution
app.use(hpp());

// Configuration CORS améliorée
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Configuration du rate limiter améliorée
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives
    message: 'Trop de tentatives de connexion, veuillez réessayer plus tard',
    standardHeaders: true,
    legacyHeaders: false
});

const apiLimiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX || 100,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard',
    standardHeaders: true,
    legacyHeaders: false
});

// Appliquer le rate limiter spécifique pour l'authentification
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Appliquer le rate limiter général pour les autres routes
app.use('/api/', apiLimiter);

// Middleware de sécurité (doit être avant les routes)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173']
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(mongoSanitize());
app.use(xss());

// Configuration du logging (doit être avant les routes)
app.use(requestLogger);
app.use(errorLogger);

// Dossier public pour les fichiers statiques
app.use('/public', express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true
}));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "WorkNest API Documentation"
}));

// Routes API
app.use('/api', apiRoutes);

// Route de base
app.get('/', (req, res) => {
    res.json({ 
        message: 'API DigitalBrics est opérationnelle',
        version: '1.0.0',
        documentation: '/api-docs',
        environment: process.env.NODE_ENV
    });
});

// Gestion des erreurs améliorée
app.use((err, req, res, next) => {
    console.error('Erreur:', err);

    // Erreurs de validation Mongoose
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            status: 'error',
            message: 'Erreur de validation',
            errors
        });
    }

    // Erreurs JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: 'Token invalide. Veuillez vous reconnecter.'
        });
    }

    // Erreurs JWT expirées
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            message: 'Votre session a expiré. Veuillez vous reconnecter.'
        });
    }

    // Erreurs MongoDB
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        return res.status(500).json({
            status: 'error',
            message: 'Erreur de base de données',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Erreurs par défaut
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Une erreur est survenue',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

// Gestion des routes non trouvées
app.use((req, res) => {
    console.log('Route non trouvée:', req.method, req.url);
    res.status(404).json({ 
        status: 'error',
        message: 'Route non trouvée',
        path: req.url,
        method: req.method
    });
});

const PORT = process.env.PORT || 5000;

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Arrêt du serveur...');
    console.error(err.name, err.message);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Arrêt du serveur...');
    console.error(err.name, err.message);
    process.exit(1);
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Documentation API disponible sur http://localhost:${PORT}/api-docs`);
    console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
}); 