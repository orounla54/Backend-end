const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middlewares/auth');

// Obtenir tous les messages entre deux utilisateurs
router.get('/:userId', auth.protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Envoyer un message
router.post('/', auth.protect, async (req, res) => {
    try {
        const { content, receiverId } = req.body;

        const message = new Message({
            content,
            sender: req.user.id,
            receiver: receiverId
        });

        await message.save();
        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Marquer un message comme lu
router.put('/:messageId/read', auth.protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        
        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé' });
        }

        if (message.receiver.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Non autorisé' });
        }

        message.isRead = true;
        await message.save();

        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router; 