const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('./src/models/Service');
const Poste = require('./src/models/Poste');
const Position = require('./src/models/Position');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
const TypeTache = require('./src/models/TypeTache');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://koba:0123456789@cluster0.fssgqk3.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Supprimer les données existantes
    await Service.deleteMany({});
    await Poste.deleteMany({});
    await Position.deleteMany({});
    await User.deleteMany({});
    await TypeTache.deleteMany({});

    console.log('Données existantes supprimées');

    // Créer des services
    const services = await Service.create([
      {
        nom: 'Développement',
        description: 'Service de développement logiciel',
        type: 'technique',
        responsable: new mongoose.Types.ObjectId(),
        email: 'dev@e2c-tic.com',
        telephone: '+1234567890',
        adresse: '123 Rue du Code, Ville'
      },
      {
        nom: 'Support Technique',
        description: 'Service de support technique et maintenance',
        type: 'support',
        responsable: new mongoose.Types.ObjectId(),
        email: 'support@e2c-tic.com',
        telephone: '+1234567891',
        adresse: '456 Rue du Support, Ville'
      },
      {
        nom: 'Administration',
        description: 'Service administratif et gestion',
        type: 'administratif',
        responsable: new mongoose.Types.ObjectId(),
        email: 'admin@e2c-tic.com',
        telephone: '+1234567892',
        adresse: '789 Rue Admin, Ville'
      }
    ]);

    console.log('Services créés:', services.length);

    // Créer des postes
    const postes = await Poste.create([
      {
        nom: 'Développeur Full Stack',
        description: 'Développement frontend et backend',
        niveau: 'senior',
        service: services[0]._id
      },
      {
        nom: 'Développeur Frontend',
        description: 'Développement interface utilisateur',
        niveau: 'intermediaire',
        service: services[0]._id
      },
      {
        nom: 'Développeur Backend',
        description: 'Développement API et base de données',
        niveau: 'senior',
        service: services[0]._id
      },
      {
        nom: 'Technicien Support',
        description: 'Support technique niveau 1',
        niveau: 'junior',
        service: services[1]._id
      },
      {
        nom: 'Ingénieur Support',
        description: 'Support technique niveau 2 et 3',
        niveau: 'senior',
        service: services[1]._id
      },
      {
        nom: 'Assistant Administratif',
        description: 'Gestion administrative',
        niveau: 'junior',
        service: services[2]._id
      },
      {
        nom: 'Gestionnaire Administratif',
        description: 'Gestion administrative avancée',
        niveau: 'intermediaire',
        service: services[2]._id
      }
    ]);

    console.log('Postes créés:', postes.length);

    // Créer des positions
    const positions = await Position.create([
      {
        nom: 'Opérateur',
        description: 'Opérations de base',
        niveau: 'operateur',
        service: services[0]._id
      },
      {
        nom: 'Technicien',
        description: 'Technicien spécialisé',
        niveau: 'technicien',
        service: services[0]._id
      },
      {
        nom: 'Ingénieur',
        description: 'Ingénieur de développement',
        niveau: 'ingenieur',
        service: services[0]._id
      },
      {
        nom: 'Manager',
        description: 'Gestion d\'équipe',
        niveau: 'manager',
        service: services[0]._id
      },
      {
        nom: 'Directeur Technique',
        description: 'Direction technique',
        niveau: 'directeur',
        service: services[0]._id
      },
      {
        nom: 'Technicien Support',
        description: 'Support technique',
        niveau: 'technicien',
        service: services[1]._id
      },
      {
        nom: 'Manager Support',
        description: 'Gestion du support',
        niveau: 'manager',
        service: services[1]._id
      },
      {
        nom: 'Assistant',
        description: 'Assistant administratif',
        niveau: 'operateur',
        service: services[2]._id
      },
      {
        nom: 'Gestionnaire',
        description: 'Gestionnaire administratif',
        niveau: 'technicien',
        service: services[2]._id
      }
    ]);

    console.log('Positions créées:', positions.length);

    // Créer des utilisateurs de test
    const users = await User.create([
      {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@e2c-tic.com',
        password: 'password123',
        role: 'responsable',
        service: services[0]._id,
        poste: postes[0]._id,
        position: positions[2]._id,
        actif: true
      },
      {
        nom: 'Martin',
        prenom: 'Marie',
        email: 'marie.martin@e2c-tic.com',
        password: 'password123',
        role: 'responsable',
        service: services[1]._id,
        poste: postes[3]._id,
        position: positions[5]._id,
        actif: true
      },
      {
        nom: 'Bernard',
        prenom: 'Pierre',
        email: 'pierre.bernard@e2c-tic.com',
        password: 'password123',
        role: 'admin',
        service: services[2]._id,
        poste: postes[5]._id,
        position: positions[7]._id,
        actif: true
      },
      {
        nom: 'Petit',
        prenom: 'Sophie',
        email: 'sophie.petit@e2c-tic.com',
        password: 'password123',
        role: 'utilisateur',
        service: services[0]._id,
        poste: postes[1]._id,
        position: positions[1]._id,
        actif: true
      },
      {
        nom: 'Robert',
        prenom: 'Lucas',
        email: 'lucas.robert@e2c-tic.com',
        password: 'password123',
        role: 'utilisateur',
        service: services[1]._id,
        poste: postes[4]._id,
        position: positions[6]._id,
        actif: true
      }
    ]);

    console.log('Utilisateurs créés:', users.length);

    // Supprimer l'index 'nom_1' s'il existe dans la collection typetaches
    try {
      await mongoose.connection.db.collection('typetaches').dropIndex('nom_1');
      console.log("Index 'nom_1' supprimé de typetaches");
    } catch (err) {
      if (err.codeName === 'IndexNotFound') {
        console.log("Index 'nom_1' non trouvé, rien à supprimer");
      } else {
        console.warn("Erreur lors de la suppression de l'index 'nom_1':", err.message);
      }
    }

    // Créer des types de tâches
    const typesTaches = await TypeTache.create([
      { libelle: 'Analyse', description: 'Analyse fonctionnelle ou technique' },
      { libelle: 'Développement', description: 'Développement de fonctionnalités' },
      { libelle: 'Test', description: 'Tests et validation' },
      { libelle: 'Déploiement', description: 'Mise en production' },
      { libelle: 'Maintenance', description: 'Maintenance corrective ou évolutive' }
    ]);
    console.log('Types de tâches créés:', typesTaches.length);

    // Créer des projets
    const projets = await require('./src/models/Projet').create([
      {
        titre: 'Projet Intranet',
        description: 'Développement d\'un intranet pour la société',
        statut: 'planifié',
        dateDebut: new Date('2024-06-01'),
        dateFin: new Date('2024-12-31'),
        responsable: users[0]._id,
        service: services[0]._id,
        membres: [
          { utilisateur: users[0]._id, role: 'chef' },
          { utilisateur: users[1]._id, role: 'membre' }
        ],
        budget: { prevu: 10000, reel: 0, devise: 'EUR' },
        indicateurs: [],
        documents: []
      },
      {
        titre: 'Projet Support',
        description: 'Mise en place d\'un support technique',
        statut: 'en cours',
        dateDebut: new Date('2024-01-15'),
        dateFin: new Date('2024-09-30'),
        responsable: users[1]._id,
        service: services[1]._id,
        membres: [
          { utilisateur: users[1]._id, role: 'chef' },
          { utilisateur: users[2]._id, role: 'membre' }
        ],
        budget: { prevu: 5000, reel: 2000, devise: 'EUR' },
        indicateurs: [],
        documents: []
      }
    ]);
    console.log('Projets créés:', projets.length);

    console.log('Données de test insérées avec succès!');

  } catch (error) {
    console.error('Erreur lors de l\'insertion des données:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Exécuter le script
seedData(); 