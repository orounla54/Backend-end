const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
        select: false // Ne pas inclure le mot de passe dans les requêtes par défaut
    },
    nom: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
        minlength: [2, 'Le nom doit contenir au moins 2 caractères']
    },
    prenom: {
        type: String,
        required: [true, 'Le prénom est requis'],
        trim: true,
        minlength: [2, 'Le prénom doit contenir au moins 2 caractères']
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'responsable', 'user'],
            message: 'Le rôle doit être admin, responsable ou user'
        },
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isValidated: {
        type: Boolean,
        default: false
    },
    validationCode: {
        type: String,
        default: null
    },
    validationCodeExpires: {
        type: Date,
        default: null
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    profilePicture: {
        type: String,
        default: ''
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    resetToken: {
        type: String,
        default: null
    },
    resetTokenExpires: {
        type: Date,
        default: null
    },
    loginToken: {
        type: String,
        default: null
    },
    loginTokenExpires: {
        type: Date,
        default: null
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    lastPasswordChange: {
        type: Date,
        default: Date.now
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    emailVerificationExpires: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index pour améliorer les performances des requêtes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Méthode pour vérifier si le token de réinitialisation est valide
userSchema.methods.isResetTokenValid = function() {
    return this.resetTokenExpires && this.resetTokenExpires > Date.now();
};

// Méthode pour vérifier si le token de connexion est valide
userSchema.methods.isLoginTokenValid = function() {
    return this.loginTokenExpires && this.loginTokenExpires > Date.now();
};

// Méthode pour vérifier si le compte est verrouillé
userSchema.methods.isLocked = function() {
    return this.lockUntil && this.lockUntil > Date.now();
};

// Méthode pour incrémenter les tentatives de connexion échouées
userSchema.methods.incrementFailedLoginAttempts = async function() {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= 5) {
        this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Verrouiller pour 30 minutes
    }
    await this.save();
};

// Méthode pour réinitialiser les tentatives de connexion échouées
userSchema.methods.resetFailedLoginAttempts = async function() {
    this.failedLoginAttempts = 0;
    this.lockUntil = null;
    await this.save();
};

// Middleware pour hacher le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
    // Ne pas hasher si le mot de passe n'a pas été modifié
    if (!this.isModified('password')) return next();
    
    // Ne pas hasher si le mot de passe est déjà hashé
    if (this.password.startsWith('$2')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        this.lastPasswordChange = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

// Méthode pour vérifier si le mot de passe a été changé après la création du token
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.lastPasswordChange) {
        const changedTimestamp = parseInt(this.lastPasswordChange.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

module.exports = mongoose.model('User', userSchema); 