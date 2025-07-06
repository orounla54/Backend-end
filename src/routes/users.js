const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  createResponsable,
  getUsersActifs
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Validation des données de responsable
const responsableValidation = [
  check('nom', 'Le nom est requis').not().isEmpty(),
  check('prenom', 'Le prénom est requis').not().isEmpty(),
  check('email', 'Veuillez inclure un email valide').isEmail(),
  check('password', 'Le mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 }),
  check('departement', 'Le département est requis').not().isEmpty(),
  check('idService', 'Le service est requis').isMongoId(),
  check('idPoste', 'Le poste est requis').isMongoId(),
  check('idPosition', 'La position est requise').isMongoId()
];

// Route publique pour l'inscription d'un responsable
router.post('/responsable/nouveau', responsableValidation, createResponsable);

// Route publique pour récupérer les utilisateurs actifs
router.get('/actifs', getUsersActifs);

// Routes protégées par authentification
router.use(protect);

// Routes admin
router.use(authorize('admin'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router; 