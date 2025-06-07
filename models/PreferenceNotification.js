const mongoose = require('mongoose');

const preferenceNotificationSchema = new mongoose.Schema({
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur est requis'],
        unique: true
    },
    canaux: {
        email: {
            active: {
                type: Boolean,
                default: true
            },
            frequence: {
                type: String,
                enum: ['immediate', 'quotidien', 'hebdomadaire'],
                default: 'immediate'
            },
            types: [{
                type: String,
                enum: [
                    'tache', 'projet', 'document', 'commentaire',
                    'mention', 'echeance', 'validation', 'systeme'
                ]
            }]
        },
        application: {
            active: {
                type: Boolean,
                default: true
            },
            son: {
                type: Boolean,
                default: true
            },
            vibration: {
                type: Boolean,
                default: true
            },
            types: [{
                type: String,
                enum: [
                    'tache', 'projet', 'document', 'commentaire',
                    'mention', 'echeance', 'validation', 'systeme'
                ]
            }]
        },
        sms: {
            active: {
                type: Boolean,
                default: false
            },
            numero: {
                type: String,
                trim: true,
                match: [/^\+?[0-9]{10,15}$/, 'Numéro de téléphone invalide']
            },
            types: [{
                type: String,
                enum: ['urgent', 'echeance']
            }]
        }
    },
    filtres: {
        priorite: {
            type: String,
            enum: ['toutes', 'haute_et_urgente', 'urgente_seulement'],
            default: 'toutes'
        },
        heures: {
            debut: {
                type: String,
                match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:mm)'],
                default: '08:00'
            },
            fin: {
                type: String,
                match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:mm)'],
                default: '18:00'
            },
            fuseauHoraire: {
                type: String,
                default: 'UTC'
            }
        },
        jours: {
            lundi: { type: Boolean, default: true },
            mardi: { type: Boolean, default: true },
            mercredi: { type: Boolean, default: true },
            jeudi: { type: Boolean, default: true },
            vendredi: { type: Boolean, default: true },
            samedi: { type: Boolean, default: false },
            dimanche: { type: Boolean, default: false }
        }
    },
    groupes: [{
        nom: {
            type: String,
            required: true,
            trim: true
        },
        types: [{
            type: String,
            enum: [
                'tache', 'projet', 'document', 'commentaire',
                'mention', 'echeance', 'validation', 'systeme'
            ]
        }],
        priorite: {
            type: String,
            enum: ['basse', 'normale', 'haute', 'urgente'],
            default: 'normale'
        },
        canaux: [{
            type: String,
            enum: ['email', 'application', 'sms']
        }]
    }],
    exclusions: [{
        type: {
            type: String,
            enum: [
                'tache', 'projet', 'document', 'commentaire',
                'mention', 'echeance', 'validation', 'systeme'
            ],
            required: true
        },
        reference: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
preferenceNotificationSchema.index({ utilisateur: 1 }, { unique: true });
preferenceNotificationSchema.index({ 'canaux.email.active': 1 });
preferenceNotificationSchema.index({ 'canaux.application.active': 1 });
preferenceNotificationSchema.index({ 'canaux.sms.active': 1 });

// Méthode pour vérifier si une notification doit être envoyée
preferenceNotificationSchema.methods.verifierEnvoiNotification = function(type, priorite) {
    // Vérifier les exclusions
    if (this.exclusions.some(e => e.type === type)) {
        return false;
    }

    // Vérifier la priorité
    if (this.filtres.priorite === 'haute_et_urgente' && !['haute', 'urgente'].includes(priorite)) {
        return false;
    }
    if (this.filtres.priorite === 'urgente_seulement' && priorite !== 'urgente') {
        return false;
    }

    // Vérifier les heures
    const maintenant = new Date();
    const heureLocale = maintenant.toLocaleTimeString('fr-FR', { 
        timeZone: this.filtres.heures.fuseauHoraire,
        hour: '2-digit',
        minute: '2-digit'
    });
    
    if (heureLocale < this.filtres.heures.debut || heureLocale > this.filtres.heures.fin) {
        return false;
    }

    // Vérifier les jours
    const jourSemaine = maintenant.toLocaleDateString('fr-FR', { 
        timeZone: this.filtres.heures.fuseauHoraire,
        weekday: 'long'
    }).toLowerCase();
    
    if (!this.filtres.jours[jourSemaine]) {
        return false;
    }

    return true;
};

// Méthode pour obtenir les canaux actifs pour un type de notification
preferenceNotificationSchema.methods.getCanauxActifs = function(type) {
    const canaux = [];
    
    if (this.canaux.email.active && this.canaux.email.types.includes(type)) {
        canaux.push('email');
    }
    
    if (this.canaux.application.active && this.canaux.application.types.includes(type)) {
        canaux.push('application');
    }
    
    if (this.canaux.sms.active && this.canaux.sms.types.includes(type)) {
        canaux.push('sms');
    }
    
    return canaux;
};

// Méthode pour ajouter une exclusion
preferenceNotificationSchema.methods.ajouterExclusion = function(type, reference) {
    if (!this.exclusions.some(e => e.type === type && e.reference.toString() === reference.toString())) {
        this.exclusions.push({ type, reference });
        return this.save();
    }
    return Promise.resolve(this);
};

// Méthode pour supprimer une exclusion
preferenceNotificationSchema.methods.supprimerExclusion = function(type, reference) {
    this.exclusions = this.exclusions.filter(e => 
        !(e.type === type && e.reference.toString() === reference.toString())
    );
    return this.save();
};

module.exports = mongoose.model('PreferenceNotification', preferenceNotificationSchema); 