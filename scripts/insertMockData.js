require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../utils/db');
const {
  projets,
  taches,
  discussions,
  sollicitations,
  evenements,
  plans,
  profiles
} = require('../data/mockData');
const {
  typeTaches,
  priorites,
  categoriesEvenements,
  typesProjets,
  services,
  postes,
  positions
} = require('../data/initialData');

// Import des modèles
const TypeTache = require('../models/TypeTache');
const TypePriorite = require('../models/TypePriorite');
const CategorieEvenement = require('../models/CategorieEvenement');
const TypeProjet = require('../models/TypeProjet');
const Service = require('../models/Service');
const Poste = require('../models/Poste');
const Position = require('../models/Position');
const Projet = require('../models/Projet');
const Tache = require('../models/Tache');
const Discussion = require('../models/Discussion');
const Sollicitation = require('../models/Sollicitation');
const Evenement = require('../models/Evenement');
const PlanStrategique = require('../models/PlanStrategique');
const User = require('../models/User');

const insertMockData = async () => {
  try {
    await connectDB();
    console.log('Connecté à la base de données');

    // Suppression des anciennes données
    await Promise.all([
      TypeTache.deleteMany({}),
      TypePriorite.deleteMany({}),
      CategorieEvenement.deleteMany({}),
      TypeProjet.deleteMany({}),
      Service.deleteMany({}),
      Poste.deleteMany({}),
      Position.deleteMany({}),
      Projet.deleteMany({}),
      Tache.deleteMany({}),
      Discussion.deleteMany({}),
      Sollicitation.deleteMany({}),
      Evenement.deleteMany({}),
      PlanStrategique.deleteMany({}),
      User.deleteMany({ email: { $in: profiles.map(p => p.email) } })
    ]);
    console.log('Anciennes données supprimées');

    // 1. Insertion des données de référence
    const [typeTachesResult, typePrioritesResult, categoriesResult, typesProjetsResult, servicesResult, postesResult, positionsResult] = await Promise.all([
      TypeTache.insertMany(typeTaches),
      TypePriorite.insertMany(priorites),
      CategorieEvenement.insertMany(categoriesEvenements),
      TypeProjet.insertMany(typesProjets),
      Service.insertMany(services),
      Poste.insertMany(postes),
      Position.insertMany(positions)
    ]);
    console.log('Données de référence insérées');

    // 2. Insertion des profils (utilisateurs)
    const users = await User.insertMany(profiles.map(profile => ({
      ...profile,
      service: servicesResult[0]._id,
      poste: postesResult[0]._id,
      position: positionsResult[0]._id
    })));
    console.log(`${users.length} profils insérés`);

    // 3. Insertion des projets
    const projetsResult = await Projet.insertMany(projets.map(projet => ({
      ...projet,
      responsable: users[0]._id,
      equipe: [users[0]._id, users[1]._id],
      type: typesProjetsResult[0]._id
    })));
    console.log(`${projetsResult.length} projets insérés`);

    // 4. Insertion des tâches
    const tachesResult = await Tache.insertMany(taches.map(tache => ({
      ...tache,
      projet: projetsResult[0]._id,
      type: typeTachesResult[0]._id,
      priorite: typePrioritesResult[0]._id,
      responsable: users[0]._id,
      assignes: [users[0]._id, users[1]._id]
    })));
    console.log(`${tachesResult.length} tâches insérées`);

    // 5. Insertion des discussions
    const discussionsResult = await Discussion.insertMany(discussions.map(discussion => ({
      ...discussion,
      participants: users.map(u => u._id),
      projet: discussion.type === 'projet' ? projetsResult[0]._id : undefined
    })));
    console.log(`${discussionsResult.length} discussions insérées`);

    // 6. Insertion des sollicitations
    const sollicitationsResult = await Sollicitation.insertMany(sollicitations.map(sollicitation => ({
      ...sollicitation,
      demandeur: users[1]._id
    })));
    console.log(`${sollicitationsResult.length} sollicitations insérées`);

    // 7. Insertion des événements
    const evenementsResult = await Evenement.insertMany(evenements.map(evenement => ({
      ...evenement,
      categorie: categoriesResult[0]._id,
      participants: users.map(u => u._id),
      organisateur: users[0]._id
    })));
    console.log(`${evenementsResult.length} événements insérés`);

    // 8. Insertion des plans stratégiques
    const plansResult = await PlanStrategique.insertMany(plans.map(plan => ({
      ...plan,
      axes: plan.axes.map(axe => ({
        ...axe,
        responsable: users[0]._id
      })),
      porteur: users[0]._id
    })));
    console.log(`${plansResult.length} plans stratégiques insérés`);

    await mongoose.disconnect();
    console.log('Déconnecté de la base de données');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données d\'exemple:', error);
    process.exit(1);
  }
};

insertMockData(); 