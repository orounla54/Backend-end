const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const { register, login, getMe, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation des données d'inscription
const registerValidation = [
  check('nom', 'Le nom est requis').not().isEmpty(),
  check('prenom', 'Le prénom est requis').not().isEmpty(),
  check('email', 'Veuillez inclure un email valide').isEmail(),
  check('password', 'Le mot de passe doit contenir au moins 8 caractères').isLength({ min: 8 })
];

// Validation des données de connexion
const loginValidation = [
  check('email', 'Veuillez inclure un email valide').isEmail(),
  check('password', 'Le mot de passe est requis').exists()
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.post('/reset-password', resetPassword);

module.exports = router; 