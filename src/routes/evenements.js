const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  getEvenements,
  getEvenement,
  createEvenement,
  updateEvenement,
  deleteEvenement,
  addCommentaire,
  addParticipant,
  getEvenementsOccurence
} = require('../controllers/evenementController');
const { protect } = require('../middleware/auth');

// Validation des données d'événement
const evenementValidation = [
  check('titre', 'Le titre est requis').not().isEmpty(),
  check('description', 'La description est requise').not().isEmpty(),
  check('type', 'Le type est requis').isIn(['reunion', 'formation', 'evenement', 'autre']),
  check('dateDebut', 'La date de début est requise').isISO8601(),
  check('dateFin', 'La date de fin est requise').isISO8601(),
  check('lieu', 'Le lieu est requis').not().isEmpty(),
  check('statut', 'Le statut est requis').isIn(['planifie', 'en_cours', 'termine', 'annule']),
  check('service', 'Le service est requis').isMongoId(),
  check('participants', 'Les participants doivent être un tableau d\'IDs valides').optional().isArray(),
  check('participants.*', 'Chaque participant doit être un ID MongoDB valide').optional().isMongoId()
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
  .get(getEvenements)
  .post(evenementValidation, createEvenement);

router.route('/:id')
  .get(getEvenement)
  .put(evenementValidation, updateEvenement)
  .delete(deleteEvenement);

// Routes pour les commentaires et participants
router.post('/:id/commentaires', commentaireValidation, addCommentaire);
router.post('/:id/participants', participantValidation, addParticipant);

router.get('/filter/evenements/occurence', getEvenementsOccurence);

module.exports = router; 