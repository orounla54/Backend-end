const Evenement = require('../models/Evenement');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Obtenir tous les événements
// @route   GET /api/evenements
// @access  Private
exports.getEvenements = async (req, res) => {
  try {
    // Construire la requête
    let query = Evenement.find()
      .populate('organisateur', 'nom prenom email')
      .populate('participants', 'nom prenom email')
      .populate('service', 'nom');

    // Filtres
    if (req.query.type) {
      query = query.where('type').equals(req.query.type);
    }
    if (req.query.service) {
      query = query.where('service').equals(req.query.service);
    }
    if (req.query.organisateur) {
      query = query.where('organisateur').equals(req.query.organisateur);
    }
    if (req.query.statut) {
      query = query.where('statut').equals(req.query.statut);
    }

    // Filtre par date
    if (req.query.dateDebut) {
      query = query.where('dateDebut').gte(new Date(req.query.dateDebut));
    }
    if (req.query.dateFin) {
      query = query.where('dateFin').lte(new Date(req.query.dateFin));
    }

    // Recherche par mot-clé
    if (req.query.search) {
      query = query.find({
        $or: [
          { titre: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
          { lieu: { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }

    // Tri
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('dateDebut');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Evenement.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Exécuter la requête
    const evenements = await query;

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
      count: evenements.length,
      pagination,
      data: evenements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements',
      error: error.message
    });
  }
};

// @desc    Obtenir un événement par ID
// @route   GET /api/evenements/:id
// @access  Private
exports.getEvenement = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id)
      .populate('organisateur', 'nom prenom email')
      .populate('participants', 'nom prenom email')
      .populate('service', 'nom')
      .populate('commentaires.utilisateur', 'nom prenom');

    if (!evenement) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    res.json({
      success: true,
      data: evenement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'événement',
      error: error.message
    });
  }
};

// @desc    Créer un nouvel événement
// @route   POST /api/evenements
// @access  Private
exports.createEvenement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Ajouter l'utilisateur connecté comme organisateur si non spécifié
    if (!req.body.organisateur) {
      req.body.organisateur = req.user.id;
    }

    // Ajouter l'organisateur comme participant
    if (!req.body.participants) {
      req.body.participants = [req.user.id];
    } else if (!req.body.participants.includes(req.user.id)) {
      req.body.participants.push(req.user.id);
    }

    const evenement = await Evenement.create(req.body);

    res.status(201).json({
      success: true,
      data: evenement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'événement',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un événement
// @route   PUT /api/evenements/:id
// @access  Private
exports.updateEvenement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let evenement = await Evenement.findById(req.params.id);

    if (!evenement) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier si l'utilisateur est l'organisateur ou un admin
    if (evenement.organisateur.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cet événement'
      });
    }

    evenement = await Evenement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: evenement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'événement',
      error: error.message
    });
  }
};

// @desc    Supprimer un événement
// @route   DELETE /api/evenements/:id
// @access  Private
exports.deleteEvenement = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);

    if (!evenement) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier si l'utilisateur est l'organisateur ou un admin
    if (evenement.organisateur.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cet événement'
      });
    }

    await evenement.remove();

    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'événement',
      error: error.message
    });
  }
};

// @desc    Ajouter un commentaire à l'événement
// @route   POST /api/evenements/:id/commentaires
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

    const evenement = await Evenement.findById(req.params.id);

    if (!evenement) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    evenement.commentaires.push({
      utilisateur: req.user.id,
      contenu
    });

    await evenement.save();

    res.json({
      success: true,
      data: evenement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du commentaire',
      error: error.message
    });
  }
};

// @desc    Ajouter un participant à l'événement
// @route   POST /api/evenements/:id/participants
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

    const evenement = await Evenement.findById(req.params.id);

    if (!evenement) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier si l'utilisateur est l'organisateur ou un admin
    if (evenement.organisateur.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier les participants'
      });
    }

    // Vérifier si le participant existe déjà
    if (evenement.participants.includes(participantId)) {
      return res.status(400).json({
        success: false,
        message: 'Le participant est déjà ajouté à cet événement'
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(participantId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    evenement.participants.push(participantId);
    await evenement.save();

    res.json({
      success: true,
      data: evenement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du participant',
      error: error.message
    });
  }
};

// @desc    Obtenir les événements d'occurrence
// @route   GET /api/evenements/occurrence
// @access  Private
exports.getEvenementsOccurence = async (req, res) => {
  try {
    const { keyword = '', eventStart, croissant } = req.query;
    // Exemple de filtre simple (à adapter selon ton modèle)
    let query = {};
    if (keyword) query.nom = { $regex: keyword, $options: 'i' };
    if (eventStart) query.dateDebut = { $gte: new Date(eventStart) };
    let sort = {};
    if (croissant === 'true') sort.dateDebut = 1;
    else if (croissant === 'false') sort.dateDebut = -1;
    const evenements = await require('../models/Evenement').find(query).sort(sort);
    res.json({ success: true, data: evenements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des événements', error: error.message });
  }
}; 