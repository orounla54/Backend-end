const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const DocumentTache = require('../models/DocumentTache');
const Tache = require('../models/Tache');

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
    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

// Middleware pour vérifier les autorisations sur une tâche
const checkTacheAccess = async (req, res, next) => {
    try {
        const tache = await Tache.findById(req.params.idTache);
        if (!tache) {
            return res.status(404).json({ message: "Tâche non trouvée." });
        }

        if (tache.responsable.toString() !== req.user.id && !tache.membres.includes(req.user.id)) {
            return res.status(403).json({ message: "Non autorisé à accéder à cette tâche." });
        }

        req.tache = tache;
        next();
    } catch (error) {
        console.error('Erreur lors de la vérification des autorisations:', error);
        res.status(500).json({ message: "Erreur lors de la vérification des autorisations" });
    }
};

// Route pour ajouter plusieurs documents pour une tâche
router.post('/taches/:idTache/documents', [auth.protect, checkTacheAccess], async (req, res) => {
    try {
        const documents = req.body.documents;
        const tacheId = req.params.idTache;

        if (!Array.isArray(documents) || documents.length === 0) {
            return res.status(400).json({ message: "Aucun document fourni." });
        }

        // Valider chaque document
        for (const doc of documents) {
            const { errors, isValid } = validateDocumentInput(doc);
            if (!isValid) {
                return res.status(400).json({ errors });
            }
        }

        const createdDocuments = await DocumentTache.insertMany(documents.map(doc => ({
            ...doc,
            tache: tacheId,
            uploadedBy: req.user.id,
            createdAt: new Date()
        })));

        // Mettre à jour la tâche avec les références des documents
        await Tache.findByIdAndUpdate(tacheId, {
            $push: { documents: { $each: createdDocuments.map(doc => doc._id) } }
        });

        res.status(201).json({
            success: true,
            message: "Documents ajoutés avec succès",
            documents: createdDocuments
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout des documents:', error);
        res.status(500).json({ 
            message: "Erreur lors de l'ajout des documents",
            error: error.message 
        });
    }
});

// Route pour récupérer les documents d'une tâche avec filtrage et pagination
router.get('/taches/:idTache/documents', [auth.protect, checkTacheAccess], async (req, res) => {
    try {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const skip = (page - 1) * limit;

        // Construire la requête de recherche
        const query = { tache: req.params.idTache };
        if (search) {
            query.$or = [
                { fileName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Construire l'option de tri
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [documents, total] = await Promise.all([
            DocumentTache.find(query)
                .populate('uploadedBy', 'username')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            DocumentTache.countDocuments(query)
        ]);

        res.json({
            success: true,
            documents,
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

// Route pour supprimer un document spécifique
router.delete('/documents/:id', auth.protect, async (req, res) => {
    try {
        const document = await DocumentTache.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: "Document non trouvé." });
        }

        // Vérifier si l'utilisateur est autorisé
        const tache = await Tache.findById(document.tache);
        if (!tache) {
            return res.status(404).json({ message: "Tâche associée non trouvée." });
        }

        if (tache.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé à supprimer ce document." });
        }

        // Supprimer le document
        await document.deleteOne();

        // Mettre à jour la tâche
        await Tache.findByIdAndUpdate(document.tache, {
            $pull: { documents: document._id }
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

// Route pour mettre à jour un document
router.put('/documents/:id', auth.protect, async (req, res) => {
    try {
        const document = await DocumentTache.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: "Document non trouvé." });
        }

        // Vérifier si l'utilisateur est autorisé
        const tache = await Tache.findById(document.tache);
        if (!tache) {
            return res.status(404).json({ message: "Tâche associée non trouvée." });
        }

        if (tache.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé à modifier ce document." });
        }

        const { fileName, description } = req.body;
        const updates = {};

        if (fileName) updates.fileName = fileName;
        if (description) updates.description = description;

        // Valider les mises à jour
        const { errors, isValid } = validateDocumentInput({ ...document.toObject(), ...updates });
        if (!isValid) {
            return res.status(400).json({ errors });
        }

        const updatedDocument = await DocumentTache.findByIdAndUpdate(
            req.params.id,
            { $set: { ...updates, updatedAt: new Date() } },
            { new: true }
        );

        res.json({
            success: true,
            message: "Document mis à jour avec succès",
            document: updatedDocument
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du document:', error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour du document",
            error: error.message 
        });
    }
});

module.exports = router;
