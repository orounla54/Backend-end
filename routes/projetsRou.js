const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const ProjetController = require("../controllers/projetsCon");

// Routes de recherche et filtrage (doivent être avant /:id)
router.get("/search", auth.protect, ProjetController.search);
router.get("/filter", auth.protect, ProjetController.filter);

// Routes principales
router.get("/", auth.protect, ProjetController.getAll);
router.post("/", auth.protect, ProjetController.create);
router.get("/:id", auth.protect, ProjetController.getById);
router.put("/:id", auth.protect, ProjetController.update);
router.delete("/:id", auth.protect, ProjetController.delete);

// Routes pour l'équipe
router.get("/:id/equipe", auth.protect, ProjetController.getEquipe);
router.post("/:id/equipe", auth.protect, ProjetController.addMembreEquipe);
router.delete("/:id/equipe/:membreId", auth.protect, ProjetController.removeMembreEquipe);

// Routes pour les documents
router.get("/:id/documents", auth.protect, ProjetController.getDocuments);
router.post("/:id/documents", auth.protect, ProjetController.addDocument);
router.delete("/:id/documents/:docId", auth.protect, ProjetController.deleteDocument);

// Routes pour les images
router.get("/:id/images", auth.protect, ProjetController.getImages);
router.post("/:id/images", auth.protect, ProjetController.addImage);
router.delete("/:id/images/:imageId", auth.protect, ProjetController.deleteImage);

// Routes pour les tâches
router.get("/:id/taches", auth.protect, ProjetController.getTaches);
router.post("/:id/taches", auth.protect, ProjetController.addTache);

// Routes pour les commentaires
router.get("/:id/commentaires", auth.protect, ProjetController.getCommentaires);
router.post("/:id/commentaires", auth.protect, ProjetController.addCommentaire);

module.exports = router;
