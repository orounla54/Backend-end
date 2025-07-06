const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  getPositions,
  getPosition,
  createPosition,
  updatePosition,
  deletePosition
} = require('../controllers/positionController');
const { protect, authorize } = require('../middleware/auth');

// Validation des données de position
const positionValidation = [
  check('nom', 'Le nom est requis').not().isEmpty(),
  check('description', 'La description est requise').not().isEmpty(),
  check('niveau', 'Le niveau doit être valide').isIn(['operateur', 'technicien', 'ingenieur', 'manager', 'directeur']),
  check('service', 'Le service doit être un ID valide').optional().isMongoId()
];

// Route publique pour l'inscription (sans authentification)
router.get('/public', getPositions);

// Routes protégées par authentification
router.use(protect);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/', getPositions);
router.get('/:id', getPosition);

// Routes admin uniquement
router.use(authorize('admin'));

router.route('/')
  .post(positionValidation, createPosition);

router.route('/:id')
  .put(positionValidation, updatePosition)
  .delete(deletePosition);

module.exports = router; 