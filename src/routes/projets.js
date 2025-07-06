const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  getProjets,
  getProjet,
  createProjet,
  updateProjet,
  deleteProjet,
  addCommentaire,
  addMembre
} = require('../controllers/projetController');
const { protect, authorize } = require('../middleware/auth');

// Validation des données de projet
const projetValidation = [
  check('titre', 'Le titre est requis').not().isEmpty(),
  check('description', 'La description est requise').not().isEmpty(),
  check('dateDebut', 'La date de début est requise').not().isEmpty(),
  check('dateFin', 'La date de fin est requise').not().isEmpty(),
  check('statut', 'Le statut est requis').isIn(['planifié', 'en cours', 'terminé', 'suspendu', 'annulé']),
  check('responsable', 'Le responsable est requis').isMongoId(),
  check('service', 'Le service est requis').isMongoId(),
  check('budget.prevu', 'Le budget prévu doit être un nombre').optional().isNumeric(),
];

// Validation des commentaires
const commentaireValidation = [
  check('contenu', 'Le contenu du commentaire est requis').not().isEmpty()
];

// Validation des membres
const membreValidation = [
  check('membreId', 'L\'ID du membre est requis').isMongoId()
];

// Route publique pour la liste des projets
router.get('/public', getProjets);

// Route publique pour la création de projet (temporaire pour les tests)
router.post('/public', projetValidation, createProjet);

// Routes protégées par authentification
router.use(protect);

// Routes principales
router.route('/')
  .get(getProjets)
  .post(projetValidation, createProjet);

router.route('/:id')
  .get(getProjet)
  .put(projetValidation, updateProjet)
  .delete(deleteProjet);

// Routes pour les commentaires et membres
router.post('/:id/commentaires', commentaireValidation, addCommentaire);
router.post('/:id/membres', membreValidation, addMembre);

module.exports = router; 