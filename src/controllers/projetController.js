const Projet = require('../models/Projet');
const Tache = require('../models/Tache');
const { validationResult } = require('express-validator');

// @desc    Obtenir tous les projets
// @route   GET /api/projets
// @access  Private
exports.getProjets = async (req, res) => {
  try {
    // Construire la requête
    let query = Projet.find()
      .populate('service', 'nom')
      .populate('responsable', 'nom prenom email')
      .populate('membres.utilisateur', 'nom prenom email');

    // Filtres
    if (req.query.statut) {
      query = query.where('statut').equals(req.query.statut);
    }
    if (req.query.service) {
      query = query.where('service').equals(req.query.service);
    }
    if (req.query.responsable) {
      query = query.where('responsable').equals(req.query.responsable);
    }
    if (req.query.keyword) {
      query = query.find({
        $or: [
          { titre: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } }
        ]
      });
    }

    // Tri
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-dateDebut');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Projet.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Exécuter la requête
    const projets = await query;

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

    // Retourner directement les projets pour la route publique
    if (req.path.includes('/public')) {
      return res.json(projets);
    }

    res.json({
      success: true,
      count: projets.length,
      pagination,
      data: projets
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets',
      error: error.message
    });
  }
};

// @desc    Obtenir un projet par ID
// @route   GET /api/projets/:id
// @access  Private
exports.getProjet = async (req, res) => {
  try {
    const projet = await Projet.findById(req.params.id)
      .populate('service', 'nom')
      .populate('responsable', 'nom prenom email')
      .populate('membres.utilisateur', 'nom prenom email');

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Récupérer les tâches associées
    const taches = await Tache.find({ projet: req.params.id })
      .populate('responsable', 'nom prenom email')
      .populate('participants', 'nom prenom email');

    res.json({
      success: true,
      data: {
        ...projet.toObject(),
        taches
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du projet',
      error: error.message
    });
  }
};

// @desc    Créer un nouveau projet
// @route   POST /api/projets
// @access  Private
exports.createProjet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Préparer les données du projet
    const projetData = {
      titre: req.body.titre,
      description: req.body.description,
      dateDebut: req.body.dateDebut,
      dateFin: req.body.dateFin,
      statut: req.body.statut,
      responsable: req.body.responsable,
      service: req.body.service,
      budget: req.body.budget || { prevu: 0, devise: 'EUR' },
      membres: [{
        utilisateur: req.body.responsable, // Utiliser le responsable comme premier membre
        role: 'chef'
      }]
    };

    console.log('Données du projet à créer:', projetData);

    const projet = await Projet.create(projetData);

    // Populate les relations pour la réponse
    const projetPopulated = await Projet.findById(projet._id)
      .populate('service', 'nom')
      .populate('responsable', 'nom prenom email')
      .populate('membres.utilisateur', 'nom prenom email');

    res.status(201).json({
      success: true,
      data: projetPopulated
    });
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un projet
// @route   PUT /api/projets/:id
// @access  Private
exports.updateProjet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let projet = await Projet.findById(req.params.id);

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Vérifier si l'utilisateur est le responsable ou un admin
    if (projet.responsable.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce projet'
      });
    }

    // Préparer les données de mise à jour
    const updateData = {
      titre: req.body.titre,
      description: req.body.description,
      dateDebut: req.body.dateDebut,
      dateFin: req.body.dateFin,
      statut: req.body.statut,
      responsable: req.body.responsable,
      service: req.body.service,
      budget: req.body.budget || projet.budget
    };

    projet = await Projet.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: projet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du projet',
      error: error.message
    });
  }
};

// @desc    Supprimer un projet
// @route   DELETE /api/projets/:id
// @access  Private
exports.deleteProjet = async (req, res) => {
  try {
    const projet = await Projet.findById(req.params.id);

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Vérifier si l'utilisateur est le responsable ou un admin
    if (projet.responsable.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce projet'
      });
    }

    // Supprimer toutes les tâches associées
    await Tache.deleteMany({ projet: req.params.id });

    // Supprimer le projet
    await projet.remove();

    res.json({
      success: true,
      message: 'Projet et tâches associées supprimés avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du projet',
      error: error.message
    });
  }
};

// @desc    Ajouter un commentaire au projet
// @route   POST /api/projets/:id/commentaires
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

    const projet = await Projet.findById(req.params.id);

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    projet.commentaires.push({
      utilisateur: req.user.id,
      contenu
    });

    await projet.save();

    res.json({
      success: true,
      data: projet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du commentaire',
      error: error.message
    });
  }
};

// @desc    Ajouter un membre au projet
// @route   POST /api/projets/:id/membres
// @access  Private
exports.addMembre = async (req, res) => {
  try {
    const { membreId } = req.body;

    if (!membreId) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du membre est requis'
      });
    }

    const projet = await Projet.findById(req.params.id);

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Vérifier si l'utilisateur est le chef ou un admin
    if (projet.chef.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier les membres'
      });
    }

    // Vérifier si le membre existe déjà
    if (projet.membres.includes(membreId)) {
      return res.status(400).json({
        success: false,
        message: 'Le membre est déjà ajouté à ce projet'
      });
    }

    projet.membres.push(membreId);
    await projet.save();

    res.json({
      success: true,
      data: projet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du membre',
      error: error.message
    });
  }
}; 