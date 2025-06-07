const Responsable = require("../models/Responsable");
const User = require("../models/User");
const Log = require("../models/log");
const Tache = require("../models/Tache");
const asyncHandler = require("express-async-handler");

// Validation des données d'entrée
const validateResponsableInput = (data) => {
    const errors = {};
    if (!data.nom) {
        errors.nom = 'Le nom est requis';
    }
    if (!data.prenom) {
        errors.prenom = 'Le prénom est requis';
    }
    if (!data.email) {
        errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Format d\'email invalide';
    }
    if (!data.telephone) {
        errors.telephone = 'Le numéro de téléphone est requis';
    }
    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

// @desc    Create a new responsable
// @route   POST /api/responsables
// @access  Private
const createResponsable = asyncHandler(async (req, res) => {
    const { errors, isValid } = validateResponsableInput(req.body);
    if (!isValid) {
        res.status(400);
        throw new Error(JSON.stringify(errors));
    }

    // Vérifier si l'email existe déjà
    const existingResponsable = await Responsable.findOne({ email: req.body.email });
    if (existingResponsable) {
        res.status(400);
        throw new Error('Un responsable avec cet email existe déjà');
    }

    const responsable = await Responsable.create({
        ...req.body,
        createdBy: req.user.id
    });

    // Créer un log
    await Log.create({
        user: req.user.id,
        action: 'create',
        model: 'Responsable',
        details: `Création du responsable ${responsable.nom} ${responsable.prenom}`,
        role: 'responsable'
    });

    res.status(201).json({
        success: true,
        message: 'Responsable créé avec succès',
        data: responsable
    });
});

// @desc    Get all responsables with filtering and pagination
// @route   GET /api/responsables
// @access  Private
const getResponsables = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    // Construire la requête de recherche
    const query = {};
    if (search) {
        query.$or = [
            { nom: { $regex: search, $options: 'i' } },
            { prenom: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Construire l'option de tri
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [responsables, total] = await Promise.all([
        Responsable.find(query)
            .populate('createdBy', 'username')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit)),
        Responsable.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: responsables,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get a single responsable
// @route   GET /api/responsables/:id
// @access  Private
const getResponsable = asyncHandler(async (req, res) => {
    const responsable = await Responsable.findById(req.params.id)
        .populate('createdBy', 'username');

    if (!responsable) {
        res.status(404);
        throw new Error("Responsable non trouvé");
    }

    res.json({
        success: true,
        data: responsable
    });
});

// @desc    Update a responsable
// @route   PUT /api/responsables/:id
// @access  Private
const updateResponsable = asyncHandler(async (req, res) => {
    const responsable = await Responsable.findById(req.params.id);
    if (!responsable) {
        res.status(404);
        throw new Error("Responsable non trouvé");
    }

    // Vérifier si l'email est déjà utilisé par un autre responsable
    if (req.body.email && req.body.email !== responsable.email) {
        const existingResponsable = await Responsable.findOne({ email: req.body.email });
        if (existingResponsable) {
            res.status(400);
            throw new Error('Cet email est déjà utilisé par un autre responsable');
        }
    }

    const { errors, isValid } = validateResponsableInput({ ...responsable.toObject(), ...req.body });
    if (!isValid) {
        res.status(400);
        throw new Error(JSON.stringify(errors));
    }

    const updatedResponsable = await Responsable.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
    ).populate('createdBy', 'username');

    // Créer un log
    await Log.create({
        user: req.user.id,
        action: 'update',
        model: 'Responsable',
        details: `Mise à jour du responsable ${updatedResponsable.nom} ${updatedResponsable.prenom}`,
        role: 'responsable'
    });

    res.json({
        success: true,
        message: 'Responsable mis à jour avec succès',
        data: updatedResponsable
    });
});

// @desc    Delete a responsable
// @route   DELETE /api/responsables/:id
// @access  Private
const deleteResponsable = asyncHandler(async (req, res) => {
    const responsable = await Responsable.findById(req.params.id);
    if (!responsable) {
        res.status(404);
        throw new Error("Responsable non trouvé");
    }

    // Vérifier si le responsable est associé à des tâches
    const tachesAssociees = await Tache.find({ responsable: req.params.id });
    if (tachesAssociees.length > 0) {
        res.status(400);
        throw new Error('Impossible de supprimer ce responsable car il est associé à des tâches');
    }

    await responsable.deleteOne();

    // Créer un log
    await Log.create({
        user: req.user.id,
        action: 'delete',
        model: 'Responsable',
        details: `Suppression du responsable ${responsable.nom} ${responsable.prenom}`,
        role: 'responsable'
    });

    res.json({
        success: true,
        message: 'Responsable supprimé avec succès'
    });
});

module.exports = {
    createResponsable,
    getResponsables,
    getResponsable,
    updateResponsable,
    deleteResponsable
}; 