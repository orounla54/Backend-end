// Projets
const projets = [
  {
    nom: 'Projet Alpha',
    description: 'Premier projet de test',
    dateDebut: new Date(),
    dateFin: new Date(Date.now() + 86400000 * 30),
    responsable: null,
    equipe: [],
    type: null,
    statut: 'planifie',
    budget: {
      prevu: 50000,
      realise: 0,
      devise: 'EUR'
    },
    progression: 0
  },
  {
    nom: 'Projet Beta',
    description: 'Deuxième projet de test',
    dateDebut: new Date(),
    dateFin: new Date(Date.now() + 86400000 * 60),
    responsable: null,
    equipe: [],
    type: null,
    statut: 'planifie',
    budget: {
      prevu: 75000,
      realise: 0,
      devise: 'EUR'
    },
    progression: 0
  }
];

// Tâches
const taches = [
  {
    nom: 'Tâche 1',
    description: 'Première tâche du projet',
    projet: null,
    type: null,
    priorite: null,
    responsable: null,
    assignes: [],
    dateDebut: new Date(),
    dateFin: new Date(Date.now() + 86400000 * 7),
    statut: 'a_faire',
    progression: 0
  },
  {
    nom: 'Tâche 2',
    description: 'Deuxième tâche du projet',
    projet: null,
    type: null,
    priorite: null,
    responsable: null,
    assignes: [],
    dateDebut: new Date(),
    dateFin: new Date(Date.now() + 86400000 * 14),
    statut: 'a_faire',
    progression: 0
  }
];

// Discussions
const discussions = [
  {
    titre: 'Discussion générale',
    participants: [],
    messages: [],
    type: 'general',
    statut: 'active'
  },
  {
    titre: 'Discussion projet Alpha',
    participants: [],
    messages: [],
    type: 'projet',
    projet: null,
    statut: 'active'
  }
];

// Sollicitations
const sollicitations = [
  {
    titre: 'Demande de matériel',
    description: 'Besoin d\'un nouvel ordinateur',
    demandeur: null,
    type: 'materiel',
    statut: 'en_attente',
    dateDemande: new Date()
  },
  {
    titre: 'Demande de congé',
    description: 'Congé pour formation',
    demandeur: null,
    type: 'congé',
    statut: 'en_attente',
    dateDemande: new Date()
  }
];

// Événements
const evenements = [
  {
    titre: 'Réunion de lancement',
    description: 'Réunion de lancement du projet Alpha',
    date: new Date(),
    dateFin: new Date(Date.now() + 7200000),
    lieu: 'Salle de réunion 1',
    categorie: null,
    participants: [],
    organisateur: null,
    type: 'reunion',
    statut: 'planifie'
  },
  {
    titre: 'Séminaire annuel',
    description: 'Séminaire de présentation des résultats',
    date: new Date(Date.now() + 86400000 * 10),
    dateFin: new Date(Date.now() + 86400000 * 10 + 28800000),
    lieu: 'Grande salle',
    categorie: null,
    participants: [],
    organisateur: null,
    type: 'seminaire',
    statut: 'planifie'
  }
];

// Plans stratégiques
const plans = [
  {
    nom: 'Plan 2024',
    description: 'Plan stratégique pour 2024',
    dateDebut: new Date(),
    dateFin: new Date(Date.now() + 86400000 * 365),
    axes: [
      {
        nom: 'Développement commercial',
        description: 'Accroître notre présence sur le marché',
        objectifs: [
          {
            description: 'Augmenter le chiffre d\'affaires de 20%',
            indicateurs: ['CA', 'Nombre de clients'],
            cibles: ['1.2M€', '50 clients'],
            echeances: new Date(Date.now() + 86400000 * 180)
          }
        ],
        responsable: null
      }
    ],
    porteur: null,
    statut: 'en_cours',
    budget: {
      montant: 100000,
      devise: 'EUR'
    }
  },
  {
    nom: 'Plan Croissance',
    description: 'Plan de croissance sur 3 ans',
    dateDebut: new Date(),
    dateFin: new Date(Date.now() + 86400000 * 365 * 3),
    axes: [
      {
        nom: 'Innovation',
        description: 'Développer de nouveaux produits',
        objectifs: [
          {
            description: 'Lancer 3 nouveaux produits',
            indicateurs: ['Nombre de produits', 'Parts de marché'],
            cibles: ['3 produits', '15%'],
            echeances: new Date(Date.now() + 86400000 * 365 * 2)
          }
        ],
        responsable: null
      }
    ],
    porteur: null,
    statut: 'en_cours',
    budget: {
      montant: 300000,
      devise: 'EUR'
    }
  }
];

// Profils
const profiles = [
  {
    nom: 'Admin',
    prenom: 'Super',
    email: 'admin@example.com',
    password: 'admin1234',
    role: 'admin',
    isActive: true,
    isValidated: true,
    service: null,
    poste: null,
    position: null
  },
  {
    nom: 'User',
    prenom: 'Test',
    email: 'user@example.com',
    password: 'user1234',
    role: 'user',
    isActive: true,
    isValidated: true,
    service: null,
    poste: null,
    position: null
  }
];

module.exports = {
  projets,
  taches,
  discussions,
  sollicitations,
  evenements,
  plans,
  profiles
}; 