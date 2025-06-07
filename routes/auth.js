const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assure-toi d'avoir ce modèle
const sendPasswordResetEmail = require('../utils/emailService'); // Ton utilitaire d'envoi d'email
const auth = require("../middlewares/auth");
const AuthController = require("../controllers/authCon");

const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète';

// Validation des données d'entrée
const validateRegisterInput = (data) => {
    const errors = {};
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Email invalide';
    }
    if (!data.password || data.password.length < 8) {
        errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!data.nom || data.nom.length < 2) {
        errors.nom = 'Le nom doit contenir au moins 2 caractères';
    }
    if (!data.prenom || data.prenom.length < 2) {
        errors.prenom = 'Le prénom doit contenir au moins 2 caractères';
    }
    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

// Routes d'authentification
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", auth.protect, AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);

// Routes de gestion du profil
router.get("/profile", auth.protect, AuthController.getProfile);
router.put("/profile", auth.protect, AuthController.updateProfile);
router.put("/profile/password", auth.protect, AuthController.updatePassword);

// Routes de réinitialisation de mot de passe
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// Routes de vérification d'email
router.post("/verify-email", AuthController.verifyEmail);
router.post("/resend-verification", AuthController.resendVerification);

// ====== VALIDATION DU PROFIL PAR CODE ======
router.post('/validate-profile', async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Aucun compte trouvé avec cet email' });
        }

        if (user.validationCode !== code || user.validationCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'Code invalide ou expiré' });
        }

        // Valider le compte
        user.isValidated = true;
        user.validationCode = undefined;
        user.validationCodeExpires = undefined;
        await user.save();

        res.json({ message: 'Compte validé avec succès' });
    } catch (error) {
        console.error('Erreur de validation:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la validation' });
    }
});

module.exports = router;
