const Tache = require('../models/Tache');
const { validationResult } = require('express-validator');

// @desc    Obtenir toutes les tâches
// @route   GET /api/taches
// @access  Private
exports.getTaches = async (req, res) => {
  try {
    // Construire la requête
    let query = Tache.find()
      .populate('responsable', 'nom prenom email')
      .populate('service', 'nom')
      .populate('projet', 'titre')
      .populate('participants', 'nom prenom email');

    // Filtres
    if (req.query.statut) {
      query = query.where('statut').equals(req.query.statut);
    }
    if (req.query.type) {
      query = query.where('type').equals(req.query.type);
    }
    if (req.query.service) {
      query = query.where('service').equals(req.query.service);
    }
    if (req.query.projet) {
      query = query.where('projet').equals(req.query.projet);
    }
    if (req.query.responsable) {
      query = query.where('responsable').equals(req.query.responsable);
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
    const total = await Tache.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Exécuter la requête
    const taches = await query;

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
      count: taches.length,
      pagination,
      data: taches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tâches',
      error: error.message
    });
  }
};

// @desc    Obtenir une tâche par ID
// @route   GET /api/taches/:id
// @access  Private
exports.getTache = async (req, res) => {
  try {
    const tache = await Tache.findById(req.params.id)
      .populate('responsable', 'nom prenom email')
      .populate('service', 'nom')
      .populate('projet', 'titre')
      .populate('participants', 'nom prenom email')
      .populate('commentaires.utilisateur', 'nom prenom');

    if (!tache) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    res.json({
      success: true,
      data: tache
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la tâche',
      error: error.message
    });
  }
};

// @desc    Créer une nouvelle tâche
// @route   POST /api/taches
// @access  Private
exports.createTache = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Ajouter l'utilisateur connecté comme responsable si non spécifié
    if (!req.body.responsable) {
      req.body.responsable = req.user.id;
    }

    const tache = await Tache.create(req.body);

    res.status(201).json({
      success: true,
      data: tache
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la tâche',
      error: error.message
    });
  }
};

// @desc    Mettre à jour une tâche
// @route   PUT /api/taches/:id
// @access  Private
exports.updateTache = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let tache = await Tache.findById(req.params.id);

    if (!tache) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    // Vérifier si l'utilisateur est le responsable ou un admin
    if (tache.responsable.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette tâche'
      });
    }

    tache = await Tache.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: tache
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la tâche',
      error: error.message
    });
  }
};

// @desc    Supprimer une tâche
// @route   DELETE /api/taches/:id
// @access  Private
exports.deleteTache = async (req, res) => {
  try {
    const tache = await Tache.findById(req.params.id);

    if (!tache) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    // Vérifier si l'utilisateur est le responsable ou un admin
    if (tache.responsable.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cette tâche'
      });
    }

    await tache.remove();

    res.json({
      success: true,
      message: 'Tâche supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la tâche',
      error: error.message
    });
  }
};

// @desc    Ajouter un commentaire à une tâche
// @route   POST /api/taches/:id/commentaires
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

    const tache = await Tache.findById(req.params.id);

    if (!tache) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    tache.commentaires.push({
      utilisateur: req.user.id,
      contenu
    });

    await tache.save();

    res.json({
      success: true,
      data: tache
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du commentaire',
      error: error.message
    });
  }
};

// @desc    Ajouter un participant à une tâche
// @route   POST /api/taches/:id/participants
// @access  Private
exports.addParticipant = async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du participant est requis'
      });
    }

    const tache = await Tache.findById(req.params.id);

    if (!tache) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    // Vérifier si l'utilisateur est le responsable ou un admin
    if (tache.responsable.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier les participants'
      });
    }

    // Vérifier si le participant existe déjà
    if (tache.participants.includes(participantId)) {
      return res.status(400).json({
        success: false,
        message: 'Le participant est déjà ajouté à cette tâche'
      });
    }

    tache.participants.push(participantId);
    await tache.save();

    res.json({
      success: true,
      data: tache
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du participant',
      error: error.message
    });
  }
};

// @desc    Filtrer les tâches
// @route   GET /api/taches/filtered
// @access  Private
exports.getFilteredTaches = async (req, res) => {
  try {
    const { keyword = '', important, urgent } = req.query;
    let query = {};
    if (keyword) query.nom = { $regex: keyword, $options: 'i' };
    if (important !== undefined) query.important = important === 'true';
    if (urgent !== undefined) query.urgent = urgent === 'true';
    const taches = await require('../models/Tache').find(query);
    res.json({ success: true, data: taches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des tâches', error: error.message });
  }
};

exports.getAllTaches = async (req, res) => {
  try {
    const taches = await Tache.find();
    res.json(taches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTypesTaches = (req, res) => {
  const types = ['Réunion', 'Appel', 'Email', 'Développement'];
  res.json({ success: true, data: types });
};

exports.getTacheImages = async (req, res) => {
  try {
    const { id } = req.params;
    // Pour l'instant, retourner un tableau vide (à adapter selon ton modèle d'images)
    const images = []; // Ici tu peux ajouter la logique pour récupérer les images depuis ta DB
    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des images', error: error.message });
  }
}; 