const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Poste = require('../models/Poste');
const Position = require('../models/Position');
const CategorieEvenement = require('../models/CategorieEvenement');
const Projet = require('../models/Projet');
const Tache = require('../models/Tache');
const Evenement = require('../models/Evenement');
const Message = require('../models/Message');
const Note = require('../models/Note');
const DocumentProjet = require('../models/DocumentProjet');
const Log = require('../models/log');
const Service = require('../models/Service');
const Responsable = require('../models/Responsable');
const Discussion = require('../models/Discussion');
require('dotenv').config();

// Configuration de la connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion_projet';

// Fonction pour nettoyer la base de données
const cleanDatabase = async () => {
    try {
        const collections = [
            User, Profile, Poste, Position, CategorieEvenement,
            Projet, Tache, Evenement, Message, Note,
            DocumentProjet, Log, Service, Responsable
        ];

        for (const collection of collections) {
            await collection.deleteMany({});
            console.log(`Collection ${collection.modelName} nettoyée`);
        }
    } catch (error) {
        console.error('Erreur lors du nettoyage de la base de données:', error);
        throw error;
    }
};

// Fonction pour créer les postes
const createPostes = async () => {
    const postes = [
        { libelle: 'Directeur', description: 'Direction générale de l\'entreprise' },
        { libelle: 'Chef de Service', description: 'Gestion d\'un service' },
        { libelle: 'Responsable de Projet', description: 'Gestion des projets' },
        { libelle: 'Développeur Senior', description: 'Développement avancé' },
        { libelle: 'Développeur Junior', description: 'Développement débutant' },
        { libelle: 'Designer UI/UX', description: 'Design d\'interface' },
        { libelle: 'Chef de Projet', description: 'Gestion de projet' },
        { libelle: 'Analyste', description: 'Analyse des besoins' }
    ];

    return await Poste.insertMany(postes);
};

// Fonction pour créer les positions
const createPositions = async () => {
    const positions = [
        { libelle: 'Directeur Général', niveau: 1 },
        { libelle: 'Directeur Technique', niveau: 2 },
        { libelle: 'Directeur Commercial', niveau: 2 },
        { libelle: 'Directeur des Ressources Humaines', niveau: 2 },
        { libelle: 'Directeur Financier', niveau: 2 },
        { libelle: 'Directeur des Opérations', niveau: 2 }
    ];

    return await Position.insertMany(positions);
};

// Fonction pour créer les catégories d'événements
const createCategories = async () => {
    const categories = [
        { libelle: 'Réunion', description: 'Réunions d\'équipe et de projet' },
        { libelle: 'Formation', description: 'Sessions de formation' },
        { libelle: 'Séminaire', description: 'Séminaires et conférences' },
        { libelle: 'Événement Social', description: 'Activités sociales' },
        { libelle: 'Atelier', description: 'Sessions de travail pratiques' },
        { libelle: 'Présentation', description: 'Présentations et démonstrations' }
    ];

    return await CategorieEvenement.insertMany(categories);
};

// Fonction pour créer l'utilisateur admin
const createAdmin = async () => {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
        email: 'admin@example.com',
        password: adminPassword,
        nom: 'Admin',
        prenom: 'System',
        role: 'admin',
        isActive: true,
        isValidated: true,
        lastLogin: new Date()
    });

    await Profile.create({
        user: admin._id,
        nom: 'Admin',
        prenom: 'System',
        poste: (await Poste.findOne({ libelle: 'Directeur' }))._id,
        departement: 'Direction',
        telephone: '+1234567890',
        competences: ['Gestion', 'Administration', 'Leadership', 'Stratégie'],
        experience: ['15 ans d\'expérience en gestion', '10 ans en direction d\'entreprise'],
        formation: ['MBA en Management', 'Master en Administration des Entreprises'],
        bio: 'Administrateur système principal avec une vaste expérience en gestion et leadership'
    });

    return admin;
};

// Fonction pour créer les services
const createServices = async () => {
    const services = [
        { libelle: 'Direction Générale' },
        { libelle: 'Ressources Humaines' },
        { libelle: 'Informatique' },
        { libelle: 'Commercial' },
        { libelle: 'Marketing' },
        { libelle: 'Finance' },
        { libelle: 'Production' },
        { libelle: 'Recherche et Développement' }
    ];

    return await Service.insertMany(services);
};

// Fonction pour créer les utilisateurs normaux
const createUsers = async (postes, positions, services) => {
    // Vérification que nous avons assez d'éléments dans chaque tableau
    if (!postes.length || !positions.length || !services.length) {
        throw new Error('Les tableaux postes, positions ou services sont vides');
    }

    const userData = [
        {
            email: 'user1@example.com',
            nom: 'Dupont',
            prenom: 'Jean',
            poste: postes[0]._id, // Directeur
            position: positions[0]._id, // Directeur Général
            service: services[0]._id, // Direction Générale
            departement: 'Direction',
            competences: ['Java', 'Spring', 'Microservices'],
            experience: ['8 ans en développement Java'],
            formation: ['Master en Informatique'],
            role: 'responsable'
        },
        {
            email: 'user2@example.com',
            nom: 'Martin',
            prenom: 'Sophie',
            poste: postes[1]._id, // Chef de Service
            position: positions[1]._id, // Directeur Technique
            service: services[2]._id, // Informatique
            departement: 'Technique',
            competences: ['Gestion de Projet', 'Agile', 'Scrum'],
            experience: ['5 ans en gestion de projet'],
            formation: ['Master en Management de Projet'],
            role: 'responsable'
        },
        {
            email: 'user3@example.com',
            nom: 'Bernard',
            prenom: 'Pierre',
            poste: postes[3]._id, // Développeur Senior
            position: positions[2]._id, // Directeur Commercial
            service: services[2]._id, // Informatique
            departement: 'Développement',
            competences: ['React', 'Node.js', 'MongoDB'],
            experience: ['6 ans en développement web'],
            formation: ['Master en Génie Logiciel'],
            role: 'user'
        },
        {
            email: 'user4@example.com',
            nom: 'Dubois',
            prenom: 'Marie',
            poste: postes[5]._id, // Designer UI/UX
            position: positions[3]._id, // Directeur des RH
            service: services[4]._id, // Marketing
            departement: 'Design',
            competences: ['UI/UX', 'Figma', 'Adobe XD'],
            experience: ['4 ans en design d\'interface'],
            formation: ['Master en Design d\'Interface'],
            role: 'user'
        }
    ];

    const users = [];
    for (const data of userData) {
        try {
            const password = await bcrypt.hash('user123', 10);
            const user = await User.create({
                email: data.email,
                password,
                nom: data.nom,
                prenom: data.prenom,
                role: data.role,
                isActive: true,
                isValidated: true,
                lastLogin: new Date()
            });

            await Profile.create({
                user: user._id,
                nom: data.nom,
                prenom: data.prenom,
                poste: data.poste,
                position: data.position,
                service: data.service,
                departement: data.departement,
                telephone: '+1234567890',
                competences: data.competences,
                experience: data.experience,
                formation: data.formation,
                bio: `Profil de ${data.prenom} ${data.nom}`
            });

            users.push(user);
            console.log(`Utilisateur créé avec succès: ${data.email}`);
        } catch (error) {
            console.error(`Erreur lors de la création de l'utilisateur ${data.email}:`, error);
            throw error;
        }
    }

    return users;
};

// Fonction pour créer les projets
const createProjets = async (users) => {
    const responsables = users.filter(user => user.role === 'responsable');
    
    const projets = await Projet.insertMany([
        {
            titre: 'Refonte du site web',
            description: 'Modernisation complète du site web de l\'entreprise avec une nouvelle interface utilisateur et des fonctionnalités améliorées',
            dateDebut: new Date(),
            dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            statut: 'en_cours',
            priorite: 'haute',
            budget: 50000,
            responsable: responsables[0]._id,
            membres: [users[2]._id, users[3]._id],
            objectifs: [
                'Améliorer l\'expérience utilisateur',
                'Optimiser les performances',
                'Ajouter de nouvelles fonctionnalités'
            ]
        },
        {
            titre: 'Application mobile',
            description: 'Développement d\'une application mobile pour les clients avec des fonctionnalités de suivi en temps réel',
            dateDebut: new Date(),
            dateFin: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            statut: 'en_attente',
            priorite: 'moyenne',
            budget: 75000,
            responsable: responsables[1]._id,
            membres: [users[0]._id, users[3]._id],
            objectifs: [
                'Créer une interface mobile intuitive',
                'Implémenter le suivi en temps réel',
                'Assurer la sécurité des données'
            ]
        },
        {
            titre: 'Système de gestion des ressources',
            description: 'Développement d\'un système intégré pour la gestion des ressources humaines et matérielles',
            dateDebut: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            dateFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            statut: 'en_attente',
            priorite: 'basse',
            budget: 100000,
            responsable: responsables[0]._id,
            membres: [users[0]._id, users[1]._id],
            objectifs: [
                'Automatiser la gestion des ressources',
                'Améliorer la traçabilité',
                'Optimiser les processus'
            ]
        }
    ]);

    return projets;
};

// Fonction pour créer les tâches
const createTaches = async (projets, users) => {
    const taches = await Tache.insertMany([
        {
            titre: 'Design de l\'interface',
            description: 'Créer les maquettes de l\'interface utilisateur avec une approche mobile-first',
            dateDebut: new Date(),
            dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            statut: 'en_cours',
            priorite: 'haute',
            important: true,
            urgent: true,
            responsable: users[3]._id,
            projet: projets[0]._id,
            membres: [users[2]._id],
            progression: 30
        },
        {
            titre: 'Développement backend',
            description: 'Implémenter les API REST avec une architecture microservices',
            dateDebut: new Date(),
            dateFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            statut: 'en_attente',
            priorite: 'moyenne',
            important: true,
            urgent: false,
            responsable: users[0]._id,
            projet: projets[0]._id,
            membres: [users[2]._id],
            progression: 0
        },
        {
            titre: 'Tests d\'intégration',
            description: 'Mettre en place les tests d\'intégration pour l\'application mobile',
            dateDebut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            dateFin: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            statut: 'en_attente',
            priorite: 'moyenne',
            important: true,
            urgent: false,
            responsable: users[1]._id,
            projet: projets[1]._id,
            membres: [users[0]._id],
            progression: 0
        }
    ]);

    return taches;
};

// Fonction pour créer les événements
const createEvenements = async (categories, users, admin) => {
    const evenements = await Evenement.insertMany([
        {
            titre: 'Réunion de lancement',
            description: 'Présentation du nouveau projet et distribution des rôles',
            dateDebut: new Date(),
            dateFin: new Date(Date.now() + 2 * 60 * 60 * 1000),
            lieu: 'Salle de conférence A',
            categorie: categories[0]._id,
            responsable: admin._id,
            participants: users.map(user => user._id),
            statut: 'confirme',
            priorite: 'haute'
        },
        {
            titre: 'Formation React',
            description: 'Formation approfondie sur React et ses écosystèmes',
            dateDebut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            dateFin: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
            lieu: 'Salle de formation B',
            categorie: categories[1]._id,
            responsable: users[1]._id,
            participants: [users[2]._id, users[3]._id],
            statut: 'planifie',
            priorite: 'moyenne'
        },
        {
            titre: 'Séminaire Agile',
            description: 'Présentation des méthodologies Agile et leur mise en pratique',
            dateDebut: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            dateFin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            lieu: 'Auditorium',
            categorie: categories[2]._id,
            responsable: users[0]._id,
            participants: users.map(user => user._id),
            statut: 'planifie',
            priorite: 'basse'
        }
    ]);

    return evenements;
};

// Fonction pour créer les messages
const createMessages = async (users, admin) => {
    // Créer d'abord une discussion
    const discussion = await Discussion.create({
        titre: 'Discussion générale',
        description: 'Discussion générale pour l\'équipe',
        participants: [...users.map(user => user._id), admin._id],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });

    const messages = await Message.insertMany([
        {
            contenu: 'Bonjour, comment avance le projet de refonte du site web ?',
            auteur: admin._id,
            discussion: discussion._id,
            isRead: false,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
            contenu: 'Tout va bien, nous sommes dans les temps. L\'équipe travaille efficacement.',
            auteur: users[0]._id,
            discussion: discussion._id,
            isRead: true,
            createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000)
        },
        {
            contenu: 'Pouvons-nous discuter de l\'architecture de l\'application mobile ?',
            auteur: users[1]._id,
            discussion: discussion._id,
            isRead: false,
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
        }
    ]);

    return messages;
};

// Fonction pour créer les notes
const createNotes = async (users, admin) => {
    const notes = await Note.insertMany([
        {
            title: 'Points à discuter',
            content: 'Liste des points à aborder lors de la prochaine réunion :\n1. Avancement du projet\n2. Problèmes rencontrés\n3. Solutions proposées',
            author: admin._id,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
            title: 'Idées d\'amélioration',
            content: 'Suggestions pour améliorer le processus de développement :\n1. Mettre en place des revues de code\n2. Automatiser les tests\n3. Améliorer la documentation',
            author: users[1]._id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
            title: 'Notes de réunion',
            content: 'Points clés de la dernière réunion :\n1. Décision sur l\'architecture\n2. Planning des prochaines étapes\n3. Distribution des tâches',
            author: users[2]._id,
            createdAt: new Date()
        }
    ]);

    return notes;
};

// Fonction pour créer les documents
const createDocuments = async (projets, users) => {
    const documents = await DocumentProjet.insertMany([
        {
            fileName: 'Spécifications techniques.pdf',
            filePath: '/documents/specs.pdf',
            description: 'Document détaillant les spécifications techniques du projet',
            fileType: 'document',
            mimeType: 'application/pdf',
            size: 1024 * 1024, // 1MB
            projet: projets[0]._id,
            uploadedBy: users[0]._id,
            status: 'active',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
            fileName: 'Maquettes UI.zip',
            filePath: '/documents/maquettes.zip',
            description: 'Archive contenant les maquettes de l\'interface utilisateur',
            fileType: 'archive',
            mimeType: 'application/zip',
            size: 5 * 1024 * 1024, // 5MB
            projet: projets[0]._id,
            uploadedBy: users[3]._id,
            status: 'active',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
    ]);

    return documents;
};

// Fonction pour créer les logs
const createLogs = async (users, admin) => {
    const logs = await Log.insertMany([
        {
            user: admin._id,
            action: 'create',
            model: 'Projet',
            details: 'Création du projet de refonte du site web',
            role: 'admin',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
            user: users[0]._id,
            action: 'update',
            model: 'Tache',
            details: 'Mise à jour de la progression de la tâche de design',
            role: 'user',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
    ]);

    return logs;
};

// Fonction principale de seeding
const seedData = async () => {
    try {
        console.log('Début du seeding des données...');

        // Nettoyer la base de données
        await cleanDatabase();

        // Créer les données de base dans l'ordre correct
        console.log('Création des services...');
        const services = await createServices();
        console.log(`${services.length} services créés`);

        console.log('Création des postes...');
        const postes = await createPostes();
        console.log(`${postes.length} postes créés`);

        console.log('Création des positions...');
        const positions = await createPositions();
        console.log(`${positions.length} positions créées`);

        console.log('Création des catégories...');
        const categories = await createCategories();
        console.log(`${categories.length} catégories créées`);

        console.log('Création de l\'admin...');
        const admin = await createAdmin();
        console.log('Admin créé');

        console.log('Création des utilisateurs...');
        const users = await createUsers(postes, positions, services);
        console.log(`${users.length} utilisateurs créés`);

        console.log('Création des projets...');
        const projets = await createProjets(users);
        console.log(`${projets.length} projets créés`);

        console.log('Création des tâches...');
        const taches = await createTaches(projets, users);
        console.log(`${taches.length} tâches créées`);

        console.log('Création des événements...');
        const evenements = await createEvenements(categories, users, admin);
        console.log(`${evenements.length} événements créés`);

        console.log('Création des messages...');
        const messages = await createMessages(users, admin);
        console.log(`${messages.length} messages créés`);

        console.log('Création des notes...');
        const notes = await createNotes(users, admin);
        console.log(`${notes.length} notes créées`);

        console.log('Création des documents...');
        const documents = await createDocuments(projets, users);
        console.log(`${documents.length} documents créés`);

        console.log('Création des logs...');
        const logs = await createLogs(users, admin);
        console.log(`${logs.length} logs créés`);

        console.log('\nDonnées de test ajoutées avec succès !');
        console.log('Récapitulatif :');
        console.log(`- ${services.length} services créés`);
        console.log(`- ${postes.length} postes créés`);
        console.log(`- ${positions.length} positions créées`);
        console.log(`- ${categories.length} catégories créées`);
        console.log(`- ${users.length + 1} utilisateurs créés (incluant l'admin)`);
        console.log(`- ${projets.length} projets créés`);
        console.log(`- ${taches.length} tâches créées`);
        console.log(`- ${evenements.length} événements créés`);
        console.log(`- ${messages.length} messages créés`);
        console.log(`- ${notes.length} notes créées`);
        console.log(`- ${documents.length} documents créés`);
        console.log(`- ${logs.length} logs créés`);

        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de l\'ajout des données de test:', error);
        process.exit(1);
    }
};

// Connexion à la base de données et exécution du seeding
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connecté à MongoDB');
    seedData();
}).catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1);
}); 