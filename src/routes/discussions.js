const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  getDiscussions,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  addReponse,
  addParticipant,
  getDiscussionMedia
} = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

// Validation des données de discussion
const discussionValidation = [
  check('titre', 'Le titre est requis').not().isEmpty(),
  check('contenu', 'Le contenu est requis').not().isEmpty(),
  check('type', 'Le type est requis').isIn(['general', 'technique', 'aide', 'autre']),
  check('statut', 'Le statut est requis').isIn(['ouverte', 'fermee', 'archivee']),
  check('service', 'Le service est requis').isMongoId(),
  check('participants', 'Les participants doivent être un tableau d\'IDs valides').optional().isArray(),
  check('participants.*', 'Chaque participant doit être un ID MongoDB valide').optional().isMongoId()
];

// Validation des réponses
const reponseValidation = [
  check('contenu', 'Le contenu de la réponse est requis').not().isEmpty()
];

// Validation des participants
const participantValidation = [
  check('participantId', 'L\'ID du participant est requis').isMongoId()
];

// Routes protégées par authentification
router.use(protect);

// Routes principales
router.route('/')
  .get(getDiscussions)
  .post(discussionValidation, createDiscussion);

router.route('/:id')
  .get(getDiscussion)
  .put(discussionValidation, updateDiscussion)
  .delete(deleteDiscussion);

// Routes pour les réponses et participants
router.post('/:id/reponses', reponseValidation, addReponse);
router.post('/:id/participants', participantValidation, addParticipant);

router.get('/mediaDiscu/:id', getDiscussionMedia);

router.post('/newMedia', require('../controllers/discussionController').uploadNewMedia);

module.exports = router; 