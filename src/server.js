const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const projetRoutes = require('./routes/projets');
const tacheRoutes = require('./routes/taches');
const evenementRoutes = require('./routes/evenements');
const discussionRoutes = require('./routes/discussions');
const statsRoutes = require('./routes/stats');
const posteRoutes = require('./routes/postes');
const positionRoutes = require('./routes/positions');
const filterRoutes = require('./routes/filter');
const featuresRoutes = require('./routes/features');
const typesTachesRoutes = require('./routes/typesTaches');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Logger en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sécurité
// Protection contre les attaques XSS
app.use(xss());

// Protection contre les injections NoSQL
app.use(mongoSanitize());

// Protection contre les attaques CSRF
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre
});
app.use('/api/auth', limiter);

// Protection contre la pollution des paramètres HTTP
app.use(hpp());

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/projets', projetRoutes);
app.use('/api/taches', tacheRoutes);
app.use('/api/evenements', evenementRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/postes', posteRoutes);
app.use('/api/positions', positionRoutes);
app.use('/filter', filterRoutes);
app.use('/api', featuresRoutes);
app.use('/api/typesTaches', typesTachesRoutes);
app.use('/api/filter/typesTaches', typesTachesRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API E2C-TIC en ligne',
    version: '1.0.0'
  });
});

// Gestionnaire d'erreurs
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`Serveur en mode ${process.env.NODE_ENV} sur le port ${PORT}`.yellow.bold);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err, promise) => {
  console.log(`Erreur: ${err.message}`.red);
  // Fermer le serveur et quitter
  server.close(() => process.exit(1));
}); 