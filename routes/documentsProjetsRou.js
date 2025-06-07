const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const DocumentProjet = require('../models/DocumentProjet');
const Projet = require('../models/Projet');
const Log = require('../models/log');

// Validation des données d'entrée
const validateDocumentInput = (data) => {
    const errors = {};
    if (!data.fileName) {
        errors.fileName = 'Le nom du fichier est requis';
    } else if (data.fileName.length > 255) {
        errors.fileName = 'Le nom du fichier ne doit pas dépasser 255 caractères';
    }
    if (!data.filePath) {
        errors.filePath = 'Le chemin du fichier est requis';
    }
    if (data.description && data.description.length > 1000) {
        errors.description = 'La description ne doit pas dépasser 1000 caractères';
    }
    // Validation du type de fichier
    if (data.fileType && !['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'].includes(data.fileType.toLowerCase())) {
        errors.fileType = 'Type de fichier non supporté';
    }
    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

// Middleware pour vérifier l'accès au projet
const checkProjetAccess = async (req, res, next) => {
    try {
        const projet = await Projet.findById(req.params.idProjet);
        if (!projet) {
            return res.status(404).json({ message: "Projet non trouvé." });
        }

        // Vérifier si l'utilisateur est autorisé
        if (projet.responsable.toString() !== req.user.id && !projet.membres.includes(req.user.id)) {
            return res.status(403).json({ message: "Non autorisé à accéder à ce projet." });
        }

        req.projet = projet;
        next();
    } catch (error) {
        console.error('Erreur lors de la vérification des autorisations:', error);
        res.status(500).json({ message: "Erreur lors de la vérification des autorisations" });
    }
};

// Route pour ajouter plusieurs documents pour un projet
router.post('/projets/:idProjet/documents', [auth.protect, checkProjetAccess], async (req, res) => {
    try {
        const documents = req.body.documents;
        const projetId = req.params.idProjet;

        if (!Array.isArray(documents) || documents.length === 0) {
            return res.status(400).json({ message: "Aucun document fourni." });
        }

        // Vérifier la taille totale des documents
        const totalSize = documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);
        if (totalSize > 100 * 1024 * 1024) { // 100MB limite
            return res.status(400).json({ message: "La taille totale des documents ne doit pas dépasser 100MB." });
        }

        // Valider chaque document
        for (const doc of documents) {
            const { errors, isValid } = validateDocumentInput(doc);
            if (!isValid) {
                return res.status(400).json({ errors });
            }
        }

        const createdDocuments = await DocumentProjet.insertMany(documents.map(doc => ({
            ...doc,
            projet: projetId,
            uploadedBy: req.user.id,
            createdAt: new Date(),
            status: 'active'
        })));

        // Mettre à jour le projet avec les références des documents
        await Projet.findByIdAndUpdate(projetId, {
            $push: { documents: { $each: createdDocuments.map(doc => doc._id) } }
        });

        // Créer un log
        await Log.create({
            user: req.user.id,
            action: 'create',
            model: 'DocumentProjet',
            details: `Ajout de ${createdDocuments.length} document(s) au projet ${req.projet.nom}`,
            role: 'user'
        });

        res.status(201).json({
            success: true,
            message: "Documents ajoutés avec succès",
            data: createdDocuments
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout des documents:', error);
        res.status(500).json({ 
            message: "Erreur lors de l'ajout des documents",
            error: error.message 
        });
    }
});

// Route pour récupérer les documents d'un projet avec filtrage et pagination
router.get('/projets/:idProjet/documents', [auth.protect, checkProjetAccess], async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            fileType,
            status,
            startDate,
            endDate
        } = req.query;
        const skip = (page - 1) * limit;

        // Construire la requête de recherche
        const query = { projet: req.params.idProjet };
        if (search) {
            query.$or = [
                { fileName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (fileType) {
            query.fileType = fileType.toLowerCase();
        }
        if (status) {
            query.status = status;
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Construire l'option de tri
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [documents, total] = await Promise.all([
            DocumentProjet.find(query)
                .populate('uploadedBy', 'username')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            DocumentProjet.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: documents,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des documents:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des documents",
            error: error.message 
        });
    }
});

// Route pour mettre à jour un document
router.put('/documents/:id', auth.protect, async (req, res) => {
    try {
        const document = await DocumentProjet.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: "Document non trouvé." });
        }

        // Vérifier si l'utilisateur est autorisé
        const projet = await Projet.findById(document.projet);
        if (!projet) {
            return res.status(404).json({ message: "Projet associé non trouvé." });
        }

        if (projet.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé à modifier ce document." });
        }

        const { fileName, description, status } = req.body;
        const updates = {};

        if (fileName) updates.fileName = fileName;
        if (description) updates.description = description;
        if (status) updates.status = status;

        // Valider les mises à jour
        const { errors, isValid } = validateDocumentInput({ ...document.toObject(), ...updates });
        if (!isValid) {
            return res.status(400).json({ errors });
        }

        const updatedDocument = await DocumentProjet.findByIdAndUpdate(
            req.params.id,
            { $set: { ...updates, updatedAt: new Date() } },
            { new: true }
        );

        // Créer un log
        await Log.create({
            user: req.user.id,
            action: 'update',
            model: 'DocumentProjet',
            details: `Mise à jour du document ${updatedDocument.fileName}`,
            role: 'user'
        });

        res.json({
            success: true,
            message: "Document mis à jour avec succès",
            data: updatedDocument
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du document:', error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour du document",
            error: error.message 
        });
    }
});

// Route pour supprimer un document spécifique
router.delete('/documents/:id', auth.protect, async (req, res) => {
    try {
        const document = await DocumentProjet.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: "Document non trouvé." });
        }

        // Vérifier si l'utilisateur est autorisé
        const projet = await Projet.findById(document.projet);
        if (!projet) {
            return res.status(404).json({ message: "Projet associé non trouvé." });
        }

        if (projet.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé à supprimer ce document." });
        }

        // Vérifier si le document est utilisé ailleurs
        const isUsed = await Projet.findOne({
            documents: document._id,
            _id: { $ne: document.projet }
        });

        if (isUsed) {
            return res.status(400).json({ 
                message: "Ce document est utilisé dans d'autres projets et ne peut pas être supprimé." 
            });
        }

        await document.deleteOne();

        // Mettre à jour le projet
        await Projet.findByIdAndUpdate(document.projet, {
            $pull: { documents: document._id }
        });

        // Créer un log
        await Log.create({
            user: req.user.id,
            action: 'delete',
            model: 'DocumentProjet',
            details: `Suppression du document ${document.fileName}`,
            role: 'user'
        });

        res.json({
            success: true,
            message: "Document supprimé avec succès"
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du document:', error);
        res.status(500).json({ 
            message: "Erreur lors de la suppression du document",
            error: error.message 
        });
    }
});

// Route pour obtenir les statistiques des documents d'un projet
router.get('/projets/:idProjet/documents/stats', [auth.protect, checkProjetAccess], async (req, res) => {
    try {
        const stats = await Promise.all([
            DocumentProjet.countDocuments({ projet: req.params.idProjet }),
            DocumentProjet.aggregate([
                { $match: { projet: req.params.idProjet } },
                { $group: { 
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }},
                { $sort: { _id: 1 } }
            ]),
            DocumentProjet.aggregate([
                { $match: { projet: req.params.idProjet } },
                { $group: {
                    _id: "$fileType",
                    count: { $sum: 1 },
                    totalSize: { $sum: "$fileSize" }
                }}
            ]),
            DocumentProjet.aggregate([
                { $match: { projet: req.params.idProjet } },
                { $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }}
            ])
        ]);

        res.json({
            success: true,
            data: {
                totalDocuments: stats[0],
                documentsByMonth: stats[1],
                documentsByType: stats[2],
                documentsByStatus: stats[3]
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

module.exports = router;
