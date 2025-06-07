const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const TacheController = require("../controllers/tachesCon");

// Routes de recherche et filtrage (doivent être avant /:id)
router.get("/search", auth.protect, TacheController.search);
router.get("/filter", auth.protect, TacheController.filter);

// Routes principales
router.get("/", auth.protect, TacheController.getAll);
router.post("/", auth.protect, TacheController.create);
router.get("/:id", auth.protect, TacheController.getById);
router.put("/:id", auth.protect, TacheController.update);
router.delete("/:id", auth.protect, TacheController.delete);

// Routes pour les sous-tâches
router.get("/:id/sous-taches", auth.protect, TacheController.getSousTaches);
router.post("/:id/sous-taches", auth.protect, TacheController.addSousTache);

// Routes pour les documents
router.get("/:id/documents", auth.protect, TacheController.getDocuments);
router.post("/:id/documents", auth.protect, TacheController.addDocument);
router.delete("/:id/documents/:docId", auth.protect, TacheController.deleteDocument);

// Routes pour les images
router.get("/:id/images", auth.protect, TacheController.getImages);
router.post("/:id/images", auth.protect, TacheController.addImage);
router.delete("/:id/images/:imageId", auth.protect, TacheController.deleteImage);

// Routes pour les discussions
router.get("/:id/discussions", auth.protect, TacheController.getDiscussions);
router.post("/:id/discussions", auth.protect, TacheController.addDiscussion);

// Routes pour les responsables
router.get("/:id/responsables", auth.protect, TacheController.getResponsables);
router.post("/:id/responsables", auth.protect, TacheController.addResponsable);
router.delete("/:id/responsables/:responsableId", auth.protect, TacheController.removeResponsable);

module.exports = router;