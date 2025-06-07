const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./error');
const { logger } = require('./logger');

// Vérification du token JWT avec gestion des erreurs améliorée
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError('Token expiré. Veuillez vous reconnecter.', 401);
        }
        if (error.name === 'JsonWebTokenError') {
            throw new AppError('Token invalide. Veuillez vous reconnecter.', 401);
        }
        throw new AppError('Erreur d\'authentification', 401);
    }
};

// Middleware de protection des routes avec logging
exports.protect = async (req, res, next) => {
    try {
        // 1. Vérifier si le token existe
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            logger.warn('Tentative d\'accès non autorisé', { ip: req.ip, path: req.path });
            throw new AppError('Non autorisé. Veuillez vous connecter.', 401);
        }

        // 2. Vérifier la validité du token
        const decoded = verifyToken(token);

        // 3. Vérifier si l'utilisateur existe toujours
        const currentUser = await User.findById(decoded.id).select('+lastLogin');
        if (!currentUser) {
            throw new AppError('L\'utilisateur associé à ce token n\'existe plus.', 401);
        }

        // 4. Vérifier si l'utilisateur a changé son mot de passe après la création du token
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            throw new AppError('L\'utilisateur a changé son mot de passe. Veuillez vous reconnecter.', 401);
        }

        // 5. Vérifier si le compte est actif
        if (!currentUser.isActive) {
            throw new AppError('Ce compte a été désactivé.', 401);
        }

        // 6. Mettre à jour le dernier accès
        currentUser.lastLogin = new Date();
        await currentUser.save({ validateBeforeSave: false });

        // 7. Ajouter l'utilisateur à la requête
        req.user = currentUser;
        next();
    } catch (error) {
        logger.error('Erreur d\'authentification', { error: error.message, ip: req.ip });
        next(error);
    }
};

// Middleware de restriction des rôles avec logging
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            logger.warn('Tentative d\'accès non autorisé', {
                userId: req.user.id,
                role: req.user.role,
                requiredRoles: roles,
                path: req.path
            });
            return next(new AppError('Vous n\'avez pas la permission d\'effectuer cette action.', 403));
        }
        next();
    };
};

// Middleware de vérification de l'email avec logging
exports.verifyEmail = async (req, res, next) => {
    try {
        if (!req.user.emailVerified) {
            logger.warn('Tentative d\'accès avec email non vérifié', {
                userId: req.user.id,
                email: req.user.email
            });
            throw new AppError('Veuillez vérifier votre email avant de continuer.', 403);
        }
        next();
    } catch (error) {
        next(error);
    }
};

// Génération de tokens avec options de sécurité
exports.generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { 
            expiresIn: '1h',
            algorithm: 'HS512'
        }
    );

    const refreshToken = jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET,
        { 
            expiresIn: '7d',
            algorithm: 'HS512'
        }
    );

    return { accessToken, refreshToken };
};

// Vérification du refresh token avec logging
exports.verifyRefreshToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            logger.warn('Tentative de refresh avec utilisateur inexistant', { userId: decoded.id });
            throw new AppError('Utilisateur non trouvé', 401);
        }

        if (!user.isActive) {
            logger.warn('Tentative de refresh avec compte inactif', { userId: user.id });
            throw new AppError('Compte désactivé', 401);
        }

        return user;
    } catch (error) {
        logger.error('Erreur de refresh token', { error: error.message });
        throw new AppError('Refresh token invalide ou expiré', 401);
    }
}; 