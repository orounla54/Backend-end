const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Log = require('../models/log');
const Profile = require('../models/Profile');

const profilesController = require('../controllers/profilesCon');

// Route de connexion
router.post('/auth', profilesController.login);

// Route pour ajouter un responsable
router.post('/responsable/nouveau', profilesController.addResponsable);

// Route pour ajouter un profil
router.post('/nouveau/:idResponsable', profilesController.addProfile);

// Route pour valider un profil
router.post('/validation', profilesController.validationProfiles);

// Route pour mettre à jour le mot de passe
router.post('/auth/updatePassword', auth.protect, profilesController.updatePassword);

// Route pour obtenir les logs
router.get('/log', auth.protect, profilesController.getByIdLog);

// Route pour demander une réinitialisation de mot de passe
router.post("/request-reset", profilesController.requestPasswordReset);

// Route pour valider le token de réinitialisation
router.get("/validate-reset/:token", profilesController.validateResetToken);

// Route pour mettre à jour le mot de passe
router.post("/reset-password/:token", profilesController.resetPassword);

// Route pour demander une connexion par mail
router.post("/connexion", profilesController.requestLoginByLinks);

// Route pour valider le token de connexion et connexion
router.get("/:id/connexion/:token", profilesController.validateLoginToken);

// Créer un profil
router.post("/", auth.protect, async (req, res) => {
    try {
        const profile = new Profile({
            user: req.user.id,
            nom: req.body.nom,
            prenom: req.body.prenom,
            poste: req.body.poste,
            departement: req.body.departement,
            telephone: req.body.telephone,
            adresse: req.body.adresse,
            competences: req.body.competences,
            experience: req.body.experience,
            formation: req.body.formation,
            bio: req.body.bio,
            photo: req.body.photo
        });
        await profile.save();
        res.status(201).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir tous les profils
router.get("/", auth.protect, async (req, res) => {
    try {
        const profiles = await Profile.find()
            .populate('user', 'username email')
            .sort({ createdAt: -1 });
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir un profil spécifique
router.get("/:id", auth.protect, async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id)
            .populate('user', 'username email');
        if (!profile) {
            return res.status(404).json({ message: "Profil non trouvé" });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour un profil
router.put("/:id", auth.protect, async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: "Profil non trouvé" });
        }
        if (profile.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }

        const updates = {
            nom: req.body.nom || profile.nom,
            prenom: req.body.prenom || profile.prenom,
            poste: req.body.poste || profile.poste,
            departement: req.body.departement || profile.departement,
            telephone: req.body.telephone || profile.telephone,
            adresse: req.body.adresse || profile.adresse,
            competences: req.body.competences || profile.competences,
            experience: req.body.experience || profile.experience,
            formation: req.body.formation || profile.formation,
            bio: req.body.bio || profile.bio,
            photo: req.body.photo || profile.photo
        };

        Object.assign(profile, updates);
        await profile.save();
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un profil
router.delete("/:id", auth.protect, async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: "Profil non trouvé" });
        }
        if (profile.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        await profile.deleteOne();
        res.json({ message: "Profil supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;