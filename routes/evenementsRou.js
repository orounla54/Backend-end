const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const EvenementController = require("../controllers/evenementsCon");

// Routes principales
router.get("/", auth.protect, EvenementController.getAll);
router.post("/", auth.protect, EvenementController.create);
router.get("/:id", auth.protect, EvenementController.getById);
router.put("/:id", auth.protect, EvenementController.update);
router.delete("/:id", auth.protect, EvenementController.delete);

// Routes de recherche et filtrage
router.get("/search", auth.protect, EvenementController.search);
router.get("/filter", auth.protect, EvenementController.filter);

// Routes pour les participants
router.get("/:id/participants", auth.protect, EvenementController.getParticipants);
router.post("/:id/participants", auth.protect, EvenementController.addParticipant);
router.delete("/:id/participants/:participantId", auth.protect, EvenementController.removeParticipant);

// Routes pour les documents
router.get("/:id/documents", auth.protect, EvenementController.getDocuments);
router.post("/:id/documents", auth.protect, EvenementController.addDocument);
router.delete("/:id/documents/:docId", auth.protect, EvenementController.deleteDocument);

// Routes pour les images
router.get("/:id/images", auth.protect, EvenementController.getImages);
router.post("/:id/images", auth.protect, EvenementController.addImage);
router.delete("/:id/images/:imageId", auth.protect, EvenementController.deleteImage);

module.exports = router;
