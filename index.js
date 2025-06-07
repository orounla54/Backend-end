const app = require('./app');
const mongoose = require('mongoose');
const TypeProjetController = require('./controllers/typesProjetCon');
const TypeTacheController = require('./controllers/typesTacheCon');

// Connexion à la base de données
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connecté à MongoDB');
        
        // Initialiser les types par défaut
        try {
            console.log('Initialisation des types par défaut...');
            await Promise.all([
                TypeProjetController.initialiserTypes(),
                TypeTacheController.initialiserTypes()
            ]);
            console.log('Types initialisés avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des types:', error);
        }

        // Démarrer le serveur
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Erreur de connexion à MongoDB:', error);
    }); 