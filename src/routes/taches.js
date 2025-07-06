const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  getTaches,
  getTache,
  createTache,
  updateTache,
  deleteTache,
  addCommentaire,
  addParticipant,
  getFilteredTaches,
  getTypesTaches
} = require('../controllers/tacheController');
const { protect, authorize } = require('../middleware/auth');

// Validation des données de tâche
const tacheValidation = [
  check('titre', 'Le titre est requis').not().isEmpty(),
  check('description', 'La description est requise').not().isEmpty(),
  check('dateDebut', 'La date de début est requise').not().isEmpty(),
  check('dateFin', 'La date de fin est requise').not().isEmpty(),
  check('type', 'Le type est requis').isIn(['normal', 'urgent', 'critique']),
  check('statut', 'Le statut est requis').isIn(['à faire', 'en cours', 'en attente', 'terminée', 'annulée']),
  check('priorite', 'La priorité est requise').isIn(['basse', 'moyenne', 'haute']),
  check('service', 'Le service est requis').isMongoId(),
  check('projet', 'Le projet est requis').isMongoId()
];

// Validation des commentaires
const commentaireValidation = [
  check('contenu', 'Le contenu du commentaire est requis').not().isEmpty()
];

// Validation des participants
const participantValidation = [
  check('participantId', 'L\'ID du participant est requis').isMongoId()
];

// Routes protégées par authentification
router.use(protect);

// Routes principales
router.route('/')
  .get(getTaches)
  .post(tacheValidation, createTache);

router.route('/:id')
  .get(getTache)
  .put(tacheValidation, updateTache)
  .delete(deleteTache);

// Routes pour les commentaires et participants
router.post('/:id/commentaires', commentaireValidation, addCommentaire);
router.post('/:id/participants', participantValidation, addParticipant);

router.get('/filter/taches', getFilteredTaches);

router.get('/typesTaches', getTypesTaches);

router.get('/ImgsTache/:id', require('../controllers/tacheController').getTacheImages);

module.exports = router; 