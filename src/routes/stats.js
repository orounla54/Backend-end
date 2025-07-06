const express = require('express');
const router = express.Router();
const {
  getGeneralStats,
  getServiceStats,
  getUserStats
} = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

// Routes protégées par authentification
router.use(protect);

// Route pour les statistiques générales (admin uniquement)
router.get('/general', authorize('admin'), getGeneralStats);

// Route pour les statistiques d'un service
router.get('/service/:id', getServiceStats);

// Route pour les statistiques d'un utilisateur
router.get('/user/:id', getUserStats);

// Route pour les indicateurs de performance (responsable et contributeur)
router.get('/indicateurDP/responsable', require('../controllers/statsController').getIndicateurDPResponsable);
router.get('/indicateurDP/contributeur', require('../controllers/statsController').getIndicateurDPContributeur);

module.exports = router; 