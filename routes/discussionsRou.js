const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const DiscussionController = require("../controllers/discussionsCon");

// Routes principales
router.get("/", auth.protect, DiscussionController.getAll);
router.post("/", auth.protect, DiscussionController.create);
router.get("/:id", auth.protect, DiscussionController.getById);
router.put("/:id", auth.protect, DiscussionController.update);
router.delete("/:id", auth.protect, DiscussionController.delete);

// Routes de recherche
router.get("/search", auth.protect, DiscussionController.search);

// Routes pour les messages
router.get("/:id/messages", auth.protect, DiscussionController.getMessages);
router.post("/:id/messages", auth.protect, DiscussionController.addMessage);
router.delete("/:id/messages/:messageId", auth.protect, DiscussionController.deleteMessage);

// Routes pour les participants
router.get("/:id/participants", auth.protect, DiscussionController.getParticipants);
router.post("/:id/participants", auth.protect, DiscussionController.addParticipant);
router.delete("/:id/participants/:participantId", auth.protect, DiscussionController.removeParticipant);

// Routes pour les documents
router.get("/:id/documents", auth.protect, DiscussionController.getDocuments);
router.post("/:id/documents", auth.protect, DiscussionController.addDocument);
router.delete("/:id/documents/:docId", auth.protect, DiscussionController.deleteDocument);

// Routes pour les images
router.get("/:id/images", auth.protect, DiscussionController.getImages);
router.post("/:id/images", auth.protect, DiscussionController.addImage);
router.delete("/:id/images/:imageId", auth.protect, DiscussionController.deleteImage);

module.exports = router;