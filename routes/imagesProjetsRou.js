const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ImageProjet = require('../models/ImageProjet');

// Route pour ajouter plusieurs images pour un projet
router.post('/projets/:idProjet/images', auth, async (req, res) => {
    try {
        const images = req.body.images; // Assuming req.body.images is an array of { fileName, filePath }
        const projetId = req.params.idProjet;

        if (!Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ message: "Aucune image fournie." });
        }

        const createdImages = await ImageProjet.insertMany(images.map(img => ({
            ...img,
            projet: projetId
        })));

        // Optionally update the Projet model to reference these images
        // const Projet = require('../models/Projet');
        // const projet = await Projet.findById(projetId);
        // if (projet) {
        //     projet.images.push(...createdImages.map(img => img._id));
        //     await projet.save();
        // }

        res.status(201).json(createdImages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route pour récupérer les images d'un projet
router.get('/projets/:idProjet/images', auth, async (req, res) => {
    try {
        const images = await ImageProjet.find({ projet: req.params.idProjet });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route pour supprimer une image spécifique
router.delete('/images/:id', auth, async (req, res) => {
    try {
        const image = await ImageProjet.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: "Image non trouvée." });
        }
        // Optional: Remove reference from Projet model if implemented
        // const Projet = require('../models/Projet');
        // const projet = await Projet.findById(image.projet);
        // if (projet) {
        //     projet.images = projet.images.filter(imgId => imgId.toString() !== image._id.toString());
        //     await projet.save();
        // }

        await image.deleteOne();
        res.json({ message: "Image supprimée." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
