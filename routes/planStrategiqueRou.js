const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const PlanStrategique = require("../models/PlanStrategique");
const AxeStrategique = require("../models/AxeStrategique");
const ObjectifStrategique = require("../models/ObjectifStrategique");
const MesureStrategique = require("../models/MesureStrategique");
const ObjectifOperationnel = require("../models/ObjectifOperationnel");
// Assuming Indicateur model exists if referenced in MesureStrategique or ObjectifOperationnel
// const Indicateur = require("../models/Indicateur");

// Routes for Plan Strategique

// Get all Plans Strategiques
router.get("/", auth.protect, async (req, res) => {
    try {
        const plans = await PlanStrategique.find()
            .populate('responsable', 'username profilePicture')
            .sort({ dateDebut: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a Plan Strategique by ID
router.get("/:id", auth.protect, async (req, res) => {
    try {
        const plan = await PlanStrategique.findById(req.params.id)
            .populate('responsable', 'username profilePicture');
        if (!plan) {
            return res.status(404).json({ message: "Plan stratégique non trouvé" });
        }
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new Plan Strategique
router.post("/", auth.protect, async (req, res) => {
    try {
        const plan = new PlanStrategique({
            titre: req.body.titre,
            description: req.body.description,
            objectifs: req.body.objectifs,
            axesStrategiques: req.body.axesStrategiques,
            indicateurs: req.body.indicateurs,
            dateDebut: req.body.dateDebut,
            dateFin: req.body.dateFin,
            responsable: req.user.id
        });
        await plan.save();
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a Plan Strategique
router.put("/:id", auth.protect, async (req, res) => {
    try {
        const plan = await PlanStrategique.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: "Plan stratégique non trouvé" });
        }
        if (plan.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }

        const updates = {
            titre: req.body.titre || plan.titre,
            description: req.body.description || plan.description,
            objectifs: req.body.objectifs || plan.objectifs,
            axesStrategiques: req.body.axesStrategiques || plan.axesStrategiques,
            indicateurs: req.body.indicateurs || plan.indicateurs,
            dateDebut: req.body.dateDebut || plan.dateDebut,
            dateFin: req.body.dateFin || plan.dateFin
        };

        Object.assign(plan, updates);
        await plan.save();
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a Plan Strategique
router.delete("/:id", auth.protect, async (req, res) => {
    try {
        const plan = await PlanStrategique.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: "Plan stratégique non trouvé" });
        }
        if (plan.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        await plan.deleteOne();
        res.json({ message: "Plan stratégique supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Routes for Axe Strategique

// Get all Axes Strategiques (can be filtered by planStrategiqueId)
router.get("/axes", auth.protect, async (req, res) => {
    try {
        const filter = req.query.planStrategiqueId ? { planStrategique: req.query.planStrategiqueId } : {};
        const axes = await AxeStrategique.find(filter).populate('objectifsStrategiques').sort({ createdAt: 1 });
        res.json(axes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get an Axe Strategique by ID
router.get("/axes/:id", auth.protect, async (req, res) => {
    try {
        const axe = await AxeStrategique.findById(req.params.id).populate({
            path: 'objectifsStrategiques',
            populate: {
                path: 'mesuresStrategiques',
                populate: {
                    path: 'objectifsOperationnels'
                    // Optional: populate indicateurs if needed
                    // populate: { path: 'indicateurs' }
                }
            }
        });
        if (!axe) {
            return res.status(404).json({ message: "Axe Stratégique non trouvé." });
        }
        res.json(axe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new Axe Strategique
router.post("/axes", auth.protect, async (req, res) => {
    try {
        const axe = new AxeStrategique(req.body);
        await axe.save();
        // Optional: Update the parent PlanStrategique
        // const plan = await PlanStrategique.findById(axe.planStrategique);
        // if (plan) {
        //     plan.axesStrategiques.push(axe._id);
        //     await plan.save();
        // }
        res.status(201).json(axe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an Axe Strategique
router.put("/axes/:id", auth.protect, async (req, res) => {
    try {
        const axe = await AxeStrategique.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!axe) {
            return res.status(404).json({ message: "Axe Stratégique non trouvé." });
        }
        res.json(axe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete an Axe Strategique
router.delete("/axes/:id", auth.protect, async (req, res) => {
    try {
        const axe = await AxeStrategique.findByIdAndDelete(req.params.id);
        if (!axe) {
            return res.status(404).json({ message: "Axe Stratégique non trouvé." });
        }
        // Optional: Remove from parent PlanStrategique and delete related entities
        // await PlanStrategique.updateOne({ _id: axe.planStrategique }, { $pull: { axesStrategiques: axe._id } });
        // await ObjectifStrategique.deleteMany({ axeStrategique: axe._id });
        // ... similar for other models
        res.json({ message: "Axe Stratégique supprimé." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Routes for Objectif Strategique

// Get all Objectifs Strategiques (can be filtered by axeStrategiqueId)
router.get("/objectifsStrategiques", auth.protect, async (req, res) => {
    try {
        const filter = req.query.axeStrategiqueId ? { axeStrategique: req.query.axeStrategiqueId } : {};
        const objectifs = await ObjectifStrategique.find(filter).populate('mesuresStrategiques').sort({ createdAt: 1 });
        res.json(objectifs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get an Objectif Strategique by ID
router.get("/objectifsStrategiques/:id", auth.protect, async (req, res) => {
    try {
        const objectif = await ObjectifStrategique.findById(req.params.id).populate({
            path: 'mesuresStrategiques',
            populate: {
                path: 'objectifsOperationnels'
                // Optional: populate indicateurs if needed
                // populate: { path: 'indicateurs' }
            }
        });
        if (!objectif) {
            return res.status(404).json({ message: "Objectif Stratégique non trouvé." });
        }
        res.json(objectif);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new Objectif Strategique
router.post("/objectifsStrategiques", auth.protect, async (req, res) => {
    try {
        const objectif = new ObjectifStrategique(req.body);
        await objectif.save();
        // Optional: Update the parent Axe Strategique
        // const axe = await AxeStrategique.findById(objectif.axeStrategique);
        // if (axe) {
        //     axe.objectifsStrategiques.push(objectif._id);
        //     await axe.save();
        // }
        res.status(201).json(objectif);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an Objectif Strategique
router.put("/objectifsStrategiques/:id", auth.protect, async (req, res) => {
    try {
        const objectif = await ObjectifStrategique.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!objectif) {
            return res.status(404).json({ message: "Objectif Stratégique non trouvé." });
        }
        res.json(objectif);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete an Objectif Strategique
router.delete("/objectifsStrategiques/:id", auth.protect, async (req, res) => {
    try {
        const objectif = await ObjectifStrategique.findByIdAndDelete(req.params.id);
        if (!objectif) {
            return res.status(404).json({ message: "Objectif Stratégique non trouvé." });
        }
        // Optional: Remove from parent Axe Strategique and delete related entities
        // await AxeStrategique.updateOne({ _id: objectif.axeStrategique }, { $pull: { objectifsStrategiques: objectif._id } });
        // await MesureStrategique.deleteMany({ objectifStrategique: objectif._id });
        // ... similar for other models
        res.json({ message: "Objectif Stratégique supprimé." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Routes for Mesure Strategique

// Get all Mesures Strategiques (can be filtered by objectifStrategiqueId)
router.get("/mesuresStrategiques", auth.protect, async (req, res) => {
    try {
        const filter = req.query.objectifStrategiqueId ? { objectifStrategique: req.query.objectifStrategiqueId } : {};
        const mesures = await MesureStrategique.find(filter).populate('objectifsOperationnels').populate('indicateurs').sort({ createdAt: 1 });
        res.json(mesures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a Mesure Strategique by ID
router.get("/mesuresStrategiques/:id", auth.protect, async (req, res) => {
    try {
        const mesure = await MesureStrategique.findById(req.params.id).populate('objectifsOperationnels').populate('indicateurs');
        if (!mesure) {
            return res.status(404).json({ message: "Mesure Stratégique non trouvée." });
        }
        res.json(mesure);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new Mesure Strategique
router.post("/mesuresStrategiques", auth.protect, async (req, res) => {
    try {
        const mesure = new MesureStrategique(req.body);
        await mesure.save();
        // Optional: Update the parent Objectif Strategique
        // const objectif = await ObjectifStrategique.findById(mesure.objectifStrategique);
        // if (objectif) {
        //     objectif.mesuresStrategiques.push(mesure._id);
        //     await objectif.save();
        // }
        res.status(201).json(mesure);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a Mesure Strategique
router.put("/mesuresStrategiques/:id", auth.protect, async (req, res) => {
    try {
        const mesure = await MesureStrategique.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!mesure) {
            return res.status(404).json({ message: "Mesure Stratégique non trouvée." });
        }
        res.json(mesure);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a Mesure Strategique
router.delete("/mesuresStrategiques/:id", auth.protect, async (req, res) => {
    try {
        const mesure = await MesureStrategique.findByIdAndDelete(req.params.id);
        if (!mesure) {
            return res.status(404).json({ message: "Mesure Stratégique non trouvée." });
        }
        // Optional: Remove from parent Objectif Strategique and delete related entities
        // await ObjectifStrategique.updateOne({ _id: mesure.objectifStrategique }, { $pull: { mesuresStrategiques: mesure._id } });
        // await ObjectifOperationnel.deleteMany({ mesureStrategique: mesure._id });
        // ... similar for other models
        res.json({ message: "Mesure Stratégique supprimée." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Routes for Objectif Operationnel

// Get all Objectifs Operationnels (can be filtered by mesureStrategiqueId)
router.get("/objectifsOperationnels", auth.protect, async (req, res) => {
    try {
        const filter = req.query.mesureStrategiqueId ? { mesureStrategique: req.query.mesureStrategiqueId } : {};
        const objectifs = await ObjectifOperationnel.find(filter).populate('indicateurs').populate('taches').sort({ createdAt: 1 });
        res.json(objectifs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get an Objectif Operationnel by ID
router.get("/objectifsOperationnels/:id", auth.protect, async (req, res) => {
    try {
        const objectif = await ObjectifOperationnel.findById(req.params.id).populate('indicateurs').populate('taches');
        if (!objectif) {
            return res.status(404).json({ message: "Objectif Opérationnel non trouvé." });
        }
        res.json(objectif);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new Objectif Operationnel
router.post("/objectifsOperationnels", auth.protect, async (req, res) => {
    try {
        const objectif = new ObjectifOperationnel(req.body);
        await objectif.save();
        // Optional: Update the parent Mesure Strategique
        // const mesure = await MesureStrategique.findById(objectif.mesureStrategique);
        // if (mesure) {
        //     mesure.objectifsOperationnels.push(objectif._id);
        //     await mesure.save();
        // }
        res.status(201).json(objectif);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an Objectif Operationnel
router.put("/objectifsOperationnels/:id", auth.protect, async (req, res) => {
    try {
        const objectif = await ObjectifOperationnel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!objectif) {
            return res.status(404).json({ message: "Objectif Opérationnel non trouvé." });
        }
        res.json(objectif);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete an Objectif Operationnel
router.delete("/objectifsOperationnels/:id", auth.protect, async (req, res) => {
    try {
        const objectif = await ObjectifOperationnel.findByIdAndDelete(req.params.id);
        if (!objectif) {
            return res.status(404).json({ message: "Objectif Opérationnel non trouvé." });
        }
        // Optional: Remove from parent Mesure Strategique and delete related entities
        // await MesureStrategique.updateOne({ _id: objectif.mesureStrategique }, { $pull: { objectifsOperationnels: objectif._id } });
        // await Tache.updateMany({ objectifOperationnel: objectif._id }, { $unset: { objectifOperationnel: "" } }); // If Tache references ObjectifOperationnel
        // ... similar for indicators if they reference ObjectifOperationnel
        res.json({ message: "Objectif Opérationnel supprimé." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;