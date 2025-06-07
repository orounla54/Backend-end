const Priorite = require('../models/Priorite');
const TypePriorite = require('../models/TypePriorite');
const Preuve = require('../models/Preuve');
const fs = require('fs').promises;

// === PRIORITES ===
exports.getAllPriorite = async (req, res) => {
    try {
        const priorites = await Priorite.find().populate('typePriorite');
        res.json(priorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllPrioriteForResponsables = async (req, res) => {
    try {
        const priorites = await Priorite.find({ responsable: req.user._id }).populate('typePriorite');
        res.json(priorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllPrioriteForServices = async (req, res) => {
    try {
        const priorites = await Priorite.find({ service: req.user.service }).populate('typePriorite');
        res.json(priorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getByIdPriorite = async (req, res) => {
    try {
        const priorite = await Priorite.findById(req.params.id).populate('typePriorite');
        if (!priorite) return res.status(404).json({ message: 'Priorité non trouvée' });
        res.json(priorite);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTachesForPriorite = async (req, res) => {
    try {
        const priorite = await Priorite.findById(req.params.idPriorite).populate({
            path: 'taches',
            populate: { path: 'responsable', select: 'nom prenom email' }
        });
        if (!priorite) return res.status(404).json({ message: 'Priorité non trouvée' });
        res.json(priorite.taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getResponsablesByPriorite = async (req, res) => {
    try {
        const priorite = await Priorite.findById(req.params.idPriorite).populate('responsable', 'nom prenom email');
        if (!priorite) return res.status(404).json({ message: 'Priorité non trouvée' });
        res.json(priorite.responsable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.newPriorite = async (req, res) => {
    try {
        const priorite = new Priorite({ ...req.body, createdAt: new Date(), updatedAt: new Date() });
        const savedPriorite = await priorite.save();
        res.status(201).json(savedPriorite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updatePriorite = async (req, res) => {
    try {
        const updated = await Priorite.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Priorité non trouvée' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deletePriorite = async (req, res) => {
    try {
        const deleted = await Priorite.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Priorité non trouvée' });
        res.json({ message: 'Priorité supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addRespPriorite = async (req, res) => {
    try {
        const { prioriteId, responsableId } = req.body;
        const priorite = await Priorite.findById(prioriteId);
        if (!priorite) return res.status(404).json({ message: 'Priorité non trouvée' });

        priorite.responsable = responsableId;
        priorite.updatedAt = new Date();
        await priorite.save();

        res.json(priorite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.removeRespPriorite = async (req, res) => {
    try {
        const priorite = await Priorite.findById(req.params.idPriorite);
        if (!priorite) return res.status(404).json({ message: 'Priorité non trouvée' });

        priorite.responsable = null;
        priorite.updatedAt = new Date();
        await priorite.save();

        res.json({ message: 'Responsable retiré avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// === PREUVES ===
exports.addPreuves = async (req, res) => {
    try {
        if (!req.files?.length) return res.status(400).json({ message: 'Aucun fichier fourni' });

        const documents = req.files.map(file => ({
            filename: file.filename,
            path: file.path,
            mimetype: file.mimetype
        }));

        const preuve = new Preuve({
            priorite: req.body.prioriteId,
            documents,
            description: req.body.description,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedPreuve = await preuve.save();
        res.status(201).json(savedPreuve);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.addDocumentIndividually = async (req, res) => {
    try {
        if (!req.files?.length) return res.status(400).json({ message: 'Aucun fichier fourni' });

        const preuve = await Preuve.findById(req.params.idPreuve);
        if (!preuve) return res.status(404).json({ message: 'Preuve non trouvée' });

        const documents = req.files.map(file => ({
            filename: file.filename,
            path: file.path,
            mimetype: file.mimetype
        }));

        preuve.documents.push(...documents);
        preuve.updatedAt = new Date();
        await preuve.save();

        res.json(preuve);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deletePreuveWithDocuments = async (req, res) => {
    try {
        const preuve = await Preuve.findById(req.params.idPreuve);
        if (!preuve) return res.status(404).json({ message: 'Preuve non trouvée' });

        for (const doc of preuve.documents) {
            try {
                await fs.unlink(doc.path);
            } catch (err) {
                console.error(`Erreur suppression fichier ${doc.path}:`, err);
            }
        }

        await Preuve.findByIdAndDelete(req.params.idPreuve);
        res.json({ message: 'Preuve et documents supprimés avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteDocumentPreuve = async (req, res) => {
    try {
        const preuve = await Preuve.findById(req.params.idPreuve);
        if (!preuve) return res.status(404).json({ message: 'Preuve non trouvée' });

        const document = preuve.documents.id(req.params.idDocument);
        if (!document) return res.status(404).json({ message: 'Document non trouvé' });

        try {
            await fs.unlink(document.path);
        } catch (err) {
            console.error(`Erreur suppression fichier ${document.path}:`, err);
        }

        document.remove();
        preuve.updatedAt = new Date();
        await preuve.save();

        res.json({ message: 'Document supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePreuves = async (req, res) => {
    try {
        const updated = await Preuve.findByIdAndUpdate(
            req.params.idPreuve,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Preuve non trouvée' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getPreuves = async (req, res) => {
    try {
        const preuves = await Preuve.find({ priorite: req.params.idPriorite });
        res.json(preuves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPreuvesDocuments = async (req, res) => {
    try {
        const preuve = await Preuve.findById(req.params.idPreuve);
        if (!preuve) return res.status(404).json({ message: 'Preuve non trouvée' });
        res.json(preuve.documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// === TYPES DE PRIORITE ===
exports.getAllTypePriorite = async (req, res) => {
    try {
        const types = await TypePriorite.find();
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getByIdTypePriorite = async (req, res) => {
    try {
        const type = await TypePriorite.findById(req.params.id);
        if (!type) return res.status(404).json({ message: 'Type de priorité non trouvé' });
        res.json(type);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTypePriorite = async (req, res) => {
    try {
        const type = new TypePriorite({ ...req.body, createdAt: new Date(), updatedAt: new Date() });
        const savedType = await type.save();
        res.status(201).json(savedType);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateTypePriorite = async (req, res) => {
    try {
        const updated = await TypePriorite.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Type de priorité non trouvé' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteTypePriorite = async (req, res) => {
    try {
        const deleted = await TypePriorite.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Type de priorité non trouvé' });
        res.json({ message: 'Type de priorité supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
