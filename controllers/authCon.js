const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendPasswordResetEmail = require('../utils/emailService');

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

// Inscription
exports.register = async (req, res) => {
    try {
        const { errors, isValid } = validateRegisterInput(req.body);
        if (!isValid) {
            return res.status(400).json({ errors });
        }

        const { email, password, nom, prenom } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Un compte existe déjà avec cet email' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Générer un code de validation aléatoire (6 chiffres)
        const validationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Créer un nouvel utilisateur
        const user = new User({
            email,
            password: hashedPassword,
            nom,
            prenom,
            role: 'user',
            validationCode,
            validationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
        });

        await user.save();

        // Envoie du code par mail
        try {
            await sendPasswordResetEmail(email, validationCode, 'validation');
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
        }

        res.status(201).json({ 
            message: 'Inscription réussie. Vérifiez votre email pour valider votre compte.',
            user: {
                id: user._id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom
            }
        });
    } catch (error) {
        console.error('Erreur à l\'inscription:', error);
        res.status(500).json({ 
            message: 'Erreur serveur à l\'inscription',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Connexion
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation des données d'entrée
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email et mot de passe requis',
                errors: {
                    email: !email ? 'Email requis' : null,
                    password: !password ? 'Mot de passe requis' : null
                }
            });
        }

        // Chercher l'utilisateur par email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe invalide' });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe invalide' });
        }

        // Vérifier si le compte est validé
        if (!user.isValidated) {
            return res.status(403).json({ 
                message: 'Votre compte n\'est pas encore validé',
                code: user.validationCode
            });
        }

        // Vérifier si le compte est actif
        if (!user.isActive) {
            return res.status(403).json({ message: 'Votre compte a été désactivé' });
        }

        // Générer un token JWT
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role
            }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // Mettre à jour lastSeen
        user.lastSeen = new Date();
        user.isOnline = true;
        await user.save();

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen
            }
        });
    } catch (error) {
        console.error('Erreur à la connexion:', error);
        res.status(500).json({ 
            message: 'Erreur serveur à la connexion',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Déconnexion
exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
            await user.save();
        }
        res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
};

// Rafraîchir le token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token requis' });
        }

        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token });
    } catch (error) {
        res.status(401).json({ message: 'Token invalide' });
    }
};

// Obtenir le profil
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
    }
};

// Mettre à jour le profil
exports.updateProfile = async (req, res) => {
    try {
        const { nom, prenom, email } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }
            user.email = email;
            user.isValidated = false;
            // Générer un nouveau code de validation
            const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
            user.validationCode = validationCode;
            user.validationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await sendPasswordResetEmail(email, validationCode, 'validation');
        }

        if (nom) user.nom = nom;
        if (prenom) user.prenom = prenom;

        await user.save();
        res.json({ message: 'Profil mis à jour avec succès', user });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
    }
};

// Mettre à jour le mot de passe
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe' });
    }
};

// Mot de passe oublié
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Aucun compte associé à cet email' });
        }

        // Générer un code à 6 chiffres
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Enregistrer le code et sa durée de validité
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        // Envoi du mail
        await sendPasswordResetEmail(email, resetCode, 'reset');

        res.json({ message: 'Code de réinitialisation envoyé par email' });
    } catch (error) {
        console.error('Erreur demande réinitialisation:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Réinitialisation du mot de passe
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Aucun compte associé à cet email' });
        }

        if (user.resetPasswordCode !== code || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Code invalide ou expiré' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
        console.error('Erreur réinitialisation:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Vérification d'email
exports.verifyEmail = async (req, res) => {
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
};

// Renvoyer le code de vérification
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Aucun compte trouvé avec cet email' });
        }

        if (user.isValidated) {
            return res.status(400).json({ message: 'Le compte est déjà validé' });
        }

        // Générer un nouveau code
        const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.validationCode = validationCode;
        user.validationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        // Envoyer le nouveau code
        await sendPasswordResetEmail(email, validationCode, 'validation');

        res.json({ message: 'Nouveau code de vérification envoyé' });
    } catch (error) {
        console.error('Erreur renvoi code:', error);
        res.status(500).json({ message: 'Erreur serveur lors du renvoi du code' });
    }
}; 