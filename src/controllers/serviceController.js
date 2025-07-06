const Service = require('../models/Service');
const User = require('../models/User');
const Projet = require('../models/Projet');
const Tache = require('../models/Tache');
const { validationResult } = require('express-validator');

// @desc    Obtenir tous les services
// @route   GET /api/services
// @access  Private
exports.getServices = async (req, res) => {
  try {
    // Construire la requête
    let query = Service.find()
      .populate('responsable', 'nom prenom email')
      .populate('membres', 'nom prenom email');

    // Filtres
    if (req.query.type) {
      query = query.where('type').equals(req.query.type);
    }
    if (req.query.responsable) {
      query = query.where('responsable').equals(req.query.responsable);
    }

    // Recherche par mot-clé
    if (req.query.search) {
      query = query.find({
        $or: [
          { nom: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }

    // Tri
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('nom');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Service.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Exécuter la requête
    const services = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: services.length,
      pagination,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des services',
      error: error.message
    });
  }
};

// @desc    Obtenir un service par ID
// @route   GET /api/services/:id
// @access  Private
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('responsable', 'nom prenom email')
      .populate('membres', 'nom prenom email')
      .populate('commentaires.utilisateur', 'nom prenom');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Récupérer les projets associés
    const projets = await Projet.find({ service: req.params.id })
      .select('titre description statut dateDebut dateFin')
      .populate('chef', 'nom prenom');

    // Récupérer les tâches associées
    const taches = await Tache.find({ service: req.params.id })
      .select('titre description statut dateDebut dateFin')
      .populate('responsable', 'nom prenom');

    res.json({
      success: true,
      data: {
        ...service.toObject(),
        projets,
        taches
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du service',
      error: error.message
    });
  }
};

// @desc    Créer un nouveau service
// @route   POST /api/services
// @access  Private/Admin
exports.createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Vérifier si le service existe déjà
    const serviceExists = await Service.findOne({ nom: req.body.nom });
    if (serviceExists) {
      return res.status(400).json({
        success: false,
        message: 'Un service avec ce nom existe déjà'
      });
    }

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du service',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un service
// @route   PUT /api/services/:id
// @access  Private/Admin
exports.updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Vérifier si le nouveau nom existe déjà
    if (req.body.nom && req.body.nom !== service.nom) {
      const serviceExists = await Service.findOne({ nom: req.body.nom });
      if (serviceExists) {
        return res.status(400).json({
          success: false,
          message: 'Un service avec ce nom existe déjà'
        });
      }
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du service',
      error: error.message
    });
  }
};

// @desc    Supprimer un service
// @route   DELETE /api/services/:id
// @access  Private/Admin
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Vérifier s'il y a des projets ou tâches associés
    const projetsCount = await Projet.countDocuments({ service: req.params.id });
    const tachesCount = await Tache.countDocuments({ service: req.params.id });

    if (projetsCount > 0 || tachesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer le service car il contient des projets ou des tâches'
      });
    }

    // Mettre à jour les utilisateurs associés
    await User.updateMany(
      { service: req.params.id },
      { $unset: { service: 1 } }
    );

    await service.remove();

    res.json({
      success: true,
      message: 'Service supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du service',
      error: error.message
    });
  }
};

// @desc    Ajouter un commentaire au service
// @route   POST /api/services/:id/commentaires
// @access  Private
exports.addCommentaire = async (req, res) => {
  try {
    const { contenu } = req.body;

    if (!contenu) {
      return res.status(400).json({
        success: false,
        message: 'Le contenu du commentaire est requis'
      });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    service.commentaires.push({
      utilisateur: req.user.id,
      contenu
    });

    await service.save();

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du commentaire',
      error: error.message
    });
  }
};

// @desc    Ajouter un membre au service
// @route   POST /api/services/:id/membres
// @access  Private/Admin
exports.addMembre = async (req, res) => {
  try {
    const { membreId } = req.body;

    if (!membreId) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du membre est requis'
      });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Vérifier si le membre existe déjà
    if (service.membres.includes(membreId)) {
      return res.status(400).json({
        success: false,
        message: 'Le membre est déjà ajouté à ce service'
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(membreId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Mettre à jour le service de l'utilisateur
    user.service = req.params.id;
    await user.save();

    service.membres.push(membreId);
    await service.save();

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du membre',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les services pour les listes déroulantes (public)
// @route   GET /api/services/forUpdate
// @access  Public
exports.getServicesForUpdate = async (req, res) => {
  try {
    const services = await Service.find({ actif: true }, { _id: 1, nom: 1, type: 1 });
    // Retourner directement le tableau pour la compatibilité avec le frontend
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des services', error: error.message });
  }
}; 