const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { upload, processImages } = require('../middlewares/multer-configPhotoResp');
const Log = require('../models/log');
const User = require('../models/User');
const Responsable = require('../models/Responsable');
const responsablesController = require('../controllers/responsablesCon');

// Middleware pour vérifier les autorisations
const checkAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès non autorisé. Rôle administrateur requis." });
        }
        next();
    } catch (error) {
        console.error('Erreur lors de la vérification des autorisations:', error);
        res.status(500).json({ message: "Erreur lors de la vérification des autorisations" });
    }
};

// Obtenir tous les responsables avec filtrage et pagination
router.get('/responsables', auth.protect, responsablesController.getResponsables);

// Obtenir un responsable par ID
router.get('/responsables/:id', auth.protect, responsablesController.getResponsable);

// Créer un nouveau responsable (admin uniquement)
router.post('/responsables', [auth.protect, checkAdmin], responsablesController.createResponsable);

// Mettre à jour un responsable (admin uniquement)
router.put('/responsables/:id', [auth.protect, checkAdmin], responsablesController.updateResponsable);

// Supprimer un responsable (admin uniquement)
router.delete('/responsables/:id', [auth.protect, checkAdmin], responsablesController.deleteResponsable);

// Route pour obtenir les logs d'un responsable avec pagination
router.get("/log", auth.protect, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            Log.find({ user: req.user.id, role: 'responsable' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('user', 'username'),
            Log.countDocuments({ user: req.user.id, role: 'responsable' })
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des logs",
            error: error.message 
        });
    }
});

// Route pour obtenir les statistiques des responsables
router.get("/stats", auth.protect, async (req, res) => {
    try {
        const stats = await Promise.all([
            Responsable.countDocuments(),
            Responsable.countDocuments({ status: 'active' }),
            Responsable.countDocuments({ status: 'inactive' })
        ]);

        res.json({
            success: true,
            data: {
                total: stats[0],
                active: stats[1],
                inactive: stats[2]
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des statistiques",
            error: error.message 
        });
    }
});

router.post('/nouveau', async (req, res) => {
  try {
    const { nom, prenom, email, poste, departement, idService, idPoste, idPosition } = req.body;
    console.log('Données reçues:', req.body);

    // Vérifier si l'email existe déjà
    const existingResponsable = await Responsable.findOne({ email });
    if (existingResponsable) {
      return res.status(400).json({ 
        message: 'Un responsable avec cet email existe déjà. Veuillez utiliser une autre adresse email.' 
      });
    }

    const responsable = new Responsable({
      nom,
      prenom,
      email,
      poste,
      departement,
      idService,
      idPoste,
      idPosition
    });

    await responsable.save();

    res.status(201).json({ 
      message: 'Responsable créé avec succès', 
      responsableId: responsable._id 
    });
  } catch (error) {
    console.error('Erreur création responsable:', error);
    
    // Gérer spécifiquement les erreurs de duplication MongoDB
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Un responsable avec cet email existe déjà. Veuillez utiliser une autre adresse email.' 
      });
    }

    // Gérer les erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors: validationErrors 
      });
    }

    // Erreur par défaut
    res.status(500).json({ 
      message: 'Erreur lors de la création du responsable', 
      error: 'Une erreur inattendue est survenue. Veuillez réessayer.' 
    });
  }
});

module.exports = router;