const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  addCommentaire,
  addMembre,
  getServicesForUpdate
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

// Validation des données de service
const serviceValidation = [
  check('nom', 'Le nom est requis').not().isEmpty(),
  check('description', 'La description est requise').not().isEmpty(),
  check('type', 'Le type est requis').isIn(['technique', 'administratif', 'commercial', 'support']),
  check('responsable', 'Le responsable est requis').isMongoId(),
  check('email', 'L\'email doit être valide').optional().isEmail(),
  check('telephone', 'Le numéro de téléphone doit être valide').optional().matches(/^[0-9+\s-]{8,}$/),
  check('adresse', 'L\'adresse est requise').optional().not().isEmpty()
];

// Validation des commentaires
const commentaireValidation = [
  check('contenu', 'Le contenu du commentaire est requis').not().isEmpty()
];

// Validation des membres
const membreValidation = [
  check('membreId', 'L\'ID du membre est requis').isMongoId()
];

// Route publique pour l'inscription (sans authentification)
router.get('/public', getServices);

// Route publique pour la liste des services pour les listes déroulantes
router.get('/forUpdate', getServicesForUpdate);

// Routes protégées par authentification
router.use(protect);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/', getServices);
router.get('/:id', getService);
router.post('/:id/commentaires', commentaireValidation, addCommentaire);

// Routes admin uniquement
router.use(authorize('admin'));

router.route('/')
  .post(serviceValidation, createService);

router.route('/:id')
  .put(serviceValidation, updateService)
  .delete(deleteService);

router.post('/:id/membres', membreValidation, addMembre);

module.exports = router; 