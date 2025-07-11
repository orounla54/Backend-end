const mongoose = require('mongoose');
require('dotenv').config();
const Tache = require('./src/models/Tache');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://koba:0123456789@cluster0.fssgqk3.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedTaches = async () => {
  try {
    await Tache.deleteMany({});
    console.log('Toutes les tâches existantes ont été supprimées.');

    const taches = await Tache.create([
      {
        titre: 'Préparer la réunion de lancement',
        description: 'Organiser la réunion de lancement du projet',
        dateDebut: new Date('2024-07-01'),
        dateFin: new Date('2024-07-02'),
        type: 'Développement',
        statut: 'à faire',
        priorite: 'haute',
        service: null,
        projet: null,
        responsable: null,
        participants: [],
        commentaires: [],
        important: true,
        urgent: false,
        private: false
      },
      {
        titre: 'Développer la fonctionnalité d’authentification',
        description: 'Créer le module d’authentification utilisateur',
        dateDebut: new Date('2024-07-03'),
        dateFin: new Date('2024-07-10'),
        type: 'Développement',
        statut: 'en cours',
        priorite: 'moyenne',
        service: null,
        projet: null,
        responsable: null,
        participants: [],
        commentaires: [],
        important: false,
        urgent: true,
        private: false
      },
      {
        titre: 'Rédiger la documentation technique',
        description: 'Documenter le code et les API',
        dateDebut: new Date('2024-07-11'),
        dateFin: new Date('2024-07-15'),
        type: 'Documentation',
        statut: 'à faire',
        priorite: 'basse',
        service: null,
        projet: null,
        responsable: null,
        participants: [],
        commentaires: [],
        important: false,
        urgent: false,
        private: true
      }
    ]);
    console.log('Tâches créées :', taches.length);
    console.log('Seed terminé avec succès !');
  } catch (error) {
    console.error('Erreur lors du seed des tâches :', error);
  } finally {
    mongoose.connection.close();
  }
};

seedTaches(); 