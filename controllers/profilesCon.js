const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendPasswordResetEmail, sendValidationCode } = require('../services/emailService');
const jwt = require('jsonwebtoken');
const Log = require('../models/log');

// Fonction pour générer un code de validation
const generateValidationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Login function
const login = async (req, res) => {
    try {
        console.log('Données de connexion reçues:', req.body);
        const { email, password } = req.body;

        // Vérification des données requises
        if (!email || !password) {
            return res.status(400).json({ 
                message: "Email et mot de passe requis",
                received: { email: !!email, password: !!password }
            });
        }

        // Check if user exists and explicitly select password field
        const user = await User.findOne({ email }).select('+password');
        console.log('Utilisateur trouvé:', user ? { 
            email: user.email, 
            hasPassword: !!user.password,
            passwordLength: user.password ? user.password.length : 0,
            isHashed: user.password ? user.password.startsWith('$2') : false
        } : 'non trouvé');

        if (!user) {
            return res.status(404).json({ message: "Email ou mot de passe incorrect" });
        }

        // Vérification que le mot de passe est défini
        if (!user.password) {
            console.error('Mot de passe non défini pour l\'utilisateur:', email);
            return res.status(500).json({ message: "Erreur de configuration du compte" });
        }

        // Vérifier si le mot de passe est hashé
        if (!user.password.startsWith('$2')) {
            console.error('Le mot de passe n\'est pas hashé pour l\'utilisateur:', email);
            // Réhasher le mot de passe si nécessaire
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            console.log('Mot de passe réhashé pour l\'utilisateur:', email);
        }

        // Verify password using the model's method
        const isMatch = await user.comparePassword(password);
        console.log('Résultat de la comparaison des mots de passe:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        try {
            console.log('Génération du token JWT...');
            // Generate JWT token
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            console.log('Token JWT généré avec succès');

            console.log('Préparation de la réponse...');
            const response = {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            };
            console.log('Réponse préparée:', { 
                hasToken: !!response.token,
                userInfo: response.user
            });

            console.log('Envoi de la réponse...');
            res.status(200).json(response);
            console.log('Réponse envoyée avec succès');

        } catch (tokenError) {
            console.error('Erreur lors de la génération du token ou de l\'envoi de la réponse:', tokenError);
            throw tokenError; // Relancer l'erreur pour être attrapée par le catch principal
        }

    } catch (error) {
        console.error("Login error:", error);
        // Vérifier si l'erreur est liée à JWT_SECRET
        if (error.message && error.message.includes('secret')) {
            console.error('Erreur de configuration JWT_SECRET:', process.env.JWT_SECRET ? 'défini' : 'non défini');
            return res.status(500).json({ 
                message: "Erreur de configuration du serveur",
                error: process.env.NODE_ENV === 'development' ? 'JWT_SECRET non configuré' : undefined
            });
        }
        res.status(500).json({ 
            message: "Erreur lors de la connexion",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Add new responsable
const addResponsable = async (req, res) => {
    try {
        const { email, password, nom, prenom, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword,
            nom,
            prenom,
            role: role || 'responsable',
            isActive: true,
            isValidated: true
        });

        await newUser.save();

        res.status(201).json({
            message: "Responsable créé avec succès",
            user: {
                id: newUser._id,
                email: newUser.email,
                nom: newUser.nom,
                prenom: newUser.prenom,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Error adding responsable:", error);
        res.status(500).json({ message: "Erreur lors de la création du responsable" });
    }
};

// Add new profile
const addProfile = async (req, res) => {
    try {
        const { email, password, nom, prenom, role } = req.body;
        const { idResponsable } = req.params;

        console.log('Création de profil - Données reçues:', { 
            email, 
            hasPassword: !!password,
            passwordLength: password ? password.length : 0,
            nom,
            prenom,
            role
        });

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" });
        }

        // Generate validation code
        const validationCode = generateValidationCode();

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Mot de passe hashé:', {
            originalLength: password.length,
            hashedLength: hashedPassword.length,
            isHashed: hashedPassword.startsWith('$2')
        });

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword, // Utiliser directement le mot de passe hashé
            nom,
            prenom,
            role: role || 'user',
            responsable: idResponsable,
            isActive: true,
            isValidated: false,
            validationCode,
            validationCodeExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        });

        // Sauvegarder l'utilisateur sans le middleware de hashage
        await newUser.save({ validateBeforeSave: true });

        // Vérifier que le mot de passe a été correctement sauvegardé
        const savedUser = await User.findOne({ email }).select('+password');
        console.log('Utilisateur sauvegardé:', {
            email: savedUser.email,
            hasPassword: !!savedUser.password,
            passwordLength: savedUser.password ? savedUser.password.length : 0,
            isHashed: savedUser.password ? savedUser.password.startsWith('$2') : false
        });

        // Send validation code email
        try {
            await sendValidationCode(email, validationCode);
            console.log('Code de validation envoyé avec succès à:', email);
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi du code de validation:', emailError);
            // Ne pas échouer la création si l'email échoue
        }

        res.status(201).json({
            message: "Profil créé avec succès. Un code de validation a été envoyé à votre email.",
            code: validationCode, // Envoyer le code dans la réponse pour le développement
            user: {
                id: newUser._id,
                email: newUser.email,
                nom: newUser.nom,
                prenom: newUser.prenom,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Error adding profile:", error);
        res.status(500).json({ message: "Erreur lors de la création du profil" });
    }
};

// Validate profiles
const validationProfiles = async (req, res) => {
    try {
        const { userId, code } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier si le code correspond et n'est pas expiré
        if (!user.validationCode || user.validationCode !== code) {
            return res.status(400).json({ message: "Code de validation invalide" });
        }

        if (user.validationCodeExpires < Date.now()) {
            return res.status(400).json({ message: "Code de validation expiré" });
        }

        // Valider le compte
        user.isValidated = true;
        user.validationCode = undefined;
        user.validationCodeExpires = undefined;
        await user.save();

        res.status(200).json({
            message: "Profil validé avec succès",
            user: {
                id: user._id,
                email: user.email,
                isValidated: user.isValidated
            }
        });

    } catch (error) {
        console.error("Error validating profile:", error);
        res.status(500).json({ message: "Erreur lors de la validation du profil" });
    }
};

// Update password
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // From auth middleware

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe actuel incorrect" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Mot de passe mis à jour avec succès" });

    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe" });
    }
};

// Get logs by user ID
const getByIdLog = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware

        const logs = await Log.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(logs);

    } catch (error) {
        console.error("Error getting logs:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des logs" });
    }
};

// Request login by email link
const requestLoginByLinks = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Aucun compte associé à cet email" });
        }

        // Generate login token
        const loginToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Save token to user
        user.loginToken = loginToken;
        user.loginTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        // Send email with login link
        try {
            await sendPasswordResetEmail(email, loginToken, 'login');
            res.status(200).json({ message: "Un email de connexion a été envoyé" });
        } catch (emailError) {
            console.error("Error sending login email:", emailError);
            res.status(500).json({ message: "Erreur lors de l'envoi de l'email de connexion" });
        }

    } catch (error) {
        console.error("Error requesting login link:", error);
        res.status(500).json({ message: "Erreur lors de la demande de connexion" });
    }
};

// Validate login token and login
const validateLoginToken = async (req, res) => {
    try {
        const { id, token } = req.params;

        const user = await User.findOne({
            _id: id,
            loginToken: token,
            loginTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Lien de connexion invalide ou expiré" });
        }

        // Clear login token
        user.loginToken = undefined;
        user.loginTokenExpires = undefined;
        await user.save();

        // Generate new session token
        const sessionToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token: sessionToken,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error validating login token:", error);
        res.status(500).json({ message: "Erreur lors de la validation du lien de connexion" });
    }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Request password reset for:', email);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Aucun compte associé à cet email" });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Save token to user
        user.resetToken = resetToken;
        user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        // Send email with reset link
        try {
            await sendPasswordResetEmail(email, resetToken, 'reset');
            res.status(200).json({ message: "Un email de réinitialisation a été envoyé" });
        } catch (emailError) {
            console.error("Error sending reset email:", emailError);
            res.status(500).json({ message: "Erreur lors de l'envoi de l'email de réinitialisation" });
        }

    } catch (error) {
        console.error("Error requesting password reset:", error);
        res.status(500).json({ message: "Erreur lors de la demande de réinitialisation" });
    }
};

// Validate reset token
const validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        console.log("Validating reset token:", token);

        const user = await User.findOne({ 
            resetPasswordCode: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log("Invalid or expired token:", token);
            return res.status(400).json({ message: "Le code de réinitialisation est invalide ou a expiré." });
        }

        console.log("Token validated successfully for user:", user.email);
        res.status(200).json({ 
            message: "Token validé avec succès. Vous pouvez maintenant réinitialiser votre mot de passe."
        });

    } catch (error) {
        console.error("Error validating reset token:", error);
        res.status(500).json({ message: "Erreur lors de la validation du token." });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        console.log("Resetting password for token:", token);

        const user = await User.findOne({
            resetPasswordCode: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log("Invalid or expired token during password reset:", token);
            return res.status(400).json({ message: "Le code de réinitialisation est invalide ou a expiré." });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear the reset password fields
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        console.log("Password reset successfully for user:", user.email);
        res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });

    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Erreur lors de la réinitialisation du mot de passe." });
    }
};

module.exports = {
    login,
    addResponsable,
    addProfile,
    validationProfiles,
    updatePassword,
    getByIdLog,
    requestLoginByLinks,
    validateLoginToken,
    requestPasswordReset,
    validateResetToken,
    resetPassword
}; 