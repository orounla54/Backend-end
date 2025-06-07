const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Service = require("../models/Service");

const servicesController = require('../controllers/servicesCon');


// Obtenir une nouvelle 
router.get('/services', servicesController.getAll);

router.get('/services/forUpdate', auth.protect, servicesController.getAllForUpdate);

router.get('/search/services', auth.protect, servicesController.search);

router.get('/service/responsables/log', auth.protect, servicesController.getServiceRespLog);

router.get('/filter/services', auth.protect, servicesController.filter);

router.get('/services/:id', auth.protect, servicesController.getById);

router.post('/services', auth.protect, servicesController.create);

router.put('/services/:id', auth.protect, servicesController.update);

router.delete('/services/:id', auth.protect, servicesController.delete);

// Créer un service
router.post("/", auth.protect, async (req, res) => {
    try {
        const service = new Service({
            nom: req.body.nom,
            description: req.body.description,
            responsable: req.body.responsableId,
            membres: req.body.membres || [],
            departement: req.body.departement,
            statut: req.body.statut || 'actif'
        });
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir tous les services
router.get("/", auth.protect, async (req, res) => {
    try {
        const services = await Service.find()
            .populate('responsable', 'username profilePicture')
            .populate('membres', 'username profilePicture')
            .sort({ nom: 1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir un service spécifique
router.get("/:id", auth.protect, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('responsable', 'username profilePicture')
            .populate('membres', 'username profilePicture');
        if (!service) {
            return res.status(404).json({ message: "Service non trouvé" });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour un service
router.put("/:id", auth.protect, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service non trouvé" });
        }

        const updates = {
            nom: req.body.nom || service.nom,
            description: req.body.description || service.description,
            responsable: req.body.responsableId || service.responsable,
            membres: req.body.membres || service.membres,
            departement: req.body.departement || service.departement,
            statut: req.body.statut || service.statut
        };

        Object.assign(service, updates);
        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un service
router.delete("/:id", auth.protect, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service non trouvé" });
        }
        await service.deleteOne();
        res.json({ message: "Service supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ajouter un membre à un service
router.post("/:id/membres", auth.protect, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service non trouvé" });
        }
        if (service.membres.includes(req.body.membreId)) {
            return res.status(400).json({ message: "Le membre est déjà dans le service" });
        }
        service.membres.push(req.body.membreId);
        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un membre d'un service
router.delete("/:id/membres/:membreId", auth.protect, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service non trouvé" });
        }
        service.membres = service.membres.filter(membreId => membreId.toString() !== req.params.membreId);
        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;