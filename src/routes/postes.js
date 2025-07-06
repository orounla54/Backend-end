const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  getPostes,
  getPoste,
  createPoste,
  updatePoste,
  deletePoste
} = require('../controllers/posteController');
const { protect, authorize } = require('../middleware/auth');

// Validation des données de poste
const posteValidation = [
  check('nom', 'Le nom est requis').not().isEmpty(),
  check('description', 'La description est requise').not().isEmpty(),
  check('niveau', 'Le niveau doit être valide').isIn(['junior', 'intermediaire', 'senior', 'expert']),
  check('service', 'Le service doit être un ID valide').optional().isMongoId()
];

// Route publique pour l'inscription (sans authentification)
router.get('/public', getPostes);

// Routes protégées par authentification
router.use(protect);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/', getPostes);
router.get('/:id', getPoste);

// Routes admin uniquement
router.use(authorize('admin'));

router.route('/')
  .post(posteValidation, createPoste);

router.route('/:id')
  .put(posteValidation, updatePoste)
  .delete(deletePoste);

module.exports = router; 