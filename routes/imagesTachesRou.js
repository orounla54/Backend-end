const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ImageTache = require('../models/ImageTache');

// Route pour ajouter plusieurs images pour une tâche
router.post('/taches/:idTache/images', auth.protect, async (req, res) => {
    try {
        const images = req.body.images; // Assuming req.body.images is an array of { fileName, filePath }
        const tacheId = req.params.idTache;

        if (!Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ message: "Aucune image fournie." });
        }

        const createdImages = await ImageTache.insertMany(images.map(img => ({
            ...img,
            tache: tacheId
        })));

        // Optionally update the Tache model to reference these images
        // const Tache = require('../models/Tache');
        // const tache = await Tache.findById(tacheId);
        // if (tache) {
        //     tache.images.push(...createdImages.map(img => img._id));
        //     await tache.save();
        // }

        res.status(201).json(createdImages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route pour récupérer les images d'une tâche
router.get('/taches/:idTache/images', auth.protect, async (req, res) => {
    try {
        const images = await ImageTache.find({ tache: req.params.idTache });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route pour supprimer une image spécifique
router.delete('/images/:id', auth.protect, async (req, res) => {
    try {
        const image = await ImageTache.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: "Image non trouvée." });
        }
        // Optional: Remove reference from Tache model if implemented
        // const Tache = require('../models/Tache');
        // const tache = await Tache.findById(image.tache);
        // if (tache) {
        //     tache.images = tache.images.filter(imgId => imgId.toString() !== image._id.toString());
        //     await tache.save();
        // }

        await image.deleteOne();
        res.json({ message: "Image supprimée." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
