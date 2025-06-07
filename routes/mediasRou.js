const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Media = require('../models/Media');
const multer = require('../middlewares/multer-configMedias');
const { processFiles } = require('../middlewares/multer-configMedias'); // Assuming processFiles is in the same file

// Route pour ajouter un ou plusieurs médias à une discussion
router.post('/discussions/:idDiscussion/medias', auth.protect, multer.array('fichiers'), processFiles, async (req, res) => {
    try {
        const discussionId = req.params.idDiscussion;
        const files = req.files; // Files processed by multer and processFiles middleware

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "Aucun fichier fourni." });
        }

        const createdMedias = await Media.insertMany(files.map(file => ({
            discussion: discussionId,
            fileName: file.originalname,
            filePath: file.path, // Assuming file.path contains the path after processing
            fileType: file.mimetype
        })));

        // Optionally update the Discussion model to reference these medias
        // const Discussion = require('../models/Discussion');
        // const discussion = await Discussion.findById(discussionId);
        // if (discussion) {
        //     discussion.medias.push(...createdMedias.map(media => media._id));
        //     await discussion.save();
        // }

        res.status(201).json(createdMedias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route pour récupérer les médias d'une discussion
router.get('/discussions/:idDiscussion/medias', auth.protect, async (req, res) => {
    try {
        const medias = await Media.find({ discussion: req.params.idDiscussion });
        res.json(medias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route pour supprimer un média spécifique
router.delete('/medias/:id', auth.protect, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: "Média non trouvé." });
        }
        // Optional: Remove reference from Discussion model if implemented
        // const Discussion = require('../models/Discussion');
        // const discussion = await Discussion.findById(media.discussion);
        // if (discussion) {
        //     discussion.medias = discussion.medias.filter(mediaId => mediaId.toString() !== media._id.toString());
        //     await discussion.save();
        // }

        await media.deleteOne();
        // Optional: Remove the actual file from the server

        res.json({ message: "Média supprimé." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
