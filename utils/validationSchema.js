const Joi = require("joi");

// Messages d'erreur personnalisés
const customMessages = {
  'string.empty': 'Le champ {#label} ne peut pas être vide',
  'string.min': 'Le champ {#label} doit contenir au moins {#limit} caractères',
  'string.max': 'Le champ {#label} ne doit pas dépasser {#limit} caractères',
  'string.email': 'Le champ {#label} doit être une adresse email valide',
  'string.pattern.base': 'Le format du champ {#label} est invalide',
  'date.base': 'Le champ {#label} doit être une date valide',
  'number.base': 'Le champ {#label} doit être un nombre',
  'any.required': 'Le champ {#label} est requis'
};

// Validation de la connexion
const logInBodyValidation = (body) => {
  const schema = Joi.object({
    login: Joi.string().required().min(3).max(50).label("login"),
    password: Joi.string().required().min(6).max(100).label("password"),
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des tâches
const addTachesValidation = (body) => {
  const schema = Joi.object({
    libelle: Joi.string().required().min(3).max(100).label("libelle"),
    description: Joi.string().max(1000).allow('').label("description"),
    dateDebut: Joi.date().required().label("dateDebut"),
    dateFin: Joi.date().min(Joi.ref('dateDebut')).required().label("dateFin"),
    status: Joi.string().valid('en_cours', 'en_attente', 'termine', 'annule').required().label("status"),
    priorite: Joi.string().valid('basse', 'moyenne', 'haute', 'urgente').required().label("priorite"),
    projet: Joi.string().required().label("projet"),
    responsable: Joi.string().required().label("responsable"),
    membres: Joi.array().items(Joi.string()).label("membres"),
    progression: Joi.number().min(0).max(100).default(0).label("progression"),
    important: Joi.boolean().default(false).label("important"),
    urgent: Joi.boolean().default(false).label("urgent"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des projets
const addProjetValidation = (body) => {
  const schema = Joi.object({
    libelle: Joi.string().required().min(3).max(100).label("libelle"),
    description: Joi.string().max(2000).allow('').label("description"),
    dateInscription: Joi.date().default(Date.now),
    datePriseDecision: Joi.date().min(Joi.ref('dateInscription')).label("datePriseDecision"),
    deadline: Joi.date().min(Joi.ref('dateInscription')).label("deadline"),
    dateDebut: Joi.date().min(Joi.ref('datePriseDecision')).label("dateDebut"),
    dateFin: Joi.date().min(Joi.ref('dateDebut')).label("dateFin"),
    status: Joi.string().valid('en_cours', 'en_attente', 'termine', 'annule', 'planifie').required().label("status"),
    priorite: Joi.string().valid('basse', 'moyenne', 'haute', 'urgente').required().label("priorite"),
    budget: Joi.number().min(0).label("budget"),
    responsable: Joi.string().required().label("responsable"),
    membres: Joi.array().items(Joi.string()).label("membres"),
    objectifs: Joi.array().items(Joi.string().max(200)).label("objectifs"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des observations
const addObservationValidation = (body) => {
  const schema = Joi.object({
    libelle: Joi.string().required().min(3).max(500).label("libelle"),
    idProjet: Joi.string().required().label("idProjet"),
    auteur: Joi.string().required().label("auteur"),
    date: Joi.date().default(Date.now).label("date"),
    type: Joi.string().valid('info', 'warning', 'error', 'success').default('info').label("type")
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des sous-tâches
const addSousTacheValidation = (body) => {
  const schema = Joi.object({
    libelle: Joi.string().required().min(3).max(100).label("libelle"),
    description: Joi.string().max(1000).allow('').label("description"),
    idTache: Joi.string().required().label("idTache"),
    idContributeur: Joi.string().required().label("idContributeur"),
    dateDebut: Joi.date().required().label("dateDebut"),
    dateFin: Joi.date().min(Joi.ref('dateDebut')).required().label("dateFin"),
    status: Joi.string().valid('en_cours', 'en_attente', 'termine', 'annule').required().label("status"),
    priorite: Joi.string().valid('basse', 'moyenne', 'haute', 'urgente').required().label("priorite"),
    progression: Joi.number().min(0).max(100).default(0).label("progression")
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation du changement de mot de passe
const updatePasswordValidation = (body) => {
  const schema = Joi.object({
    password: Joi.string()
      .required()
      .min(8)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .label("password")
      .messages({
        'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
      }),
    oldPassword: Joi.string().required().label("oldPassword")
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des événements
const addEvent = (body) => {
  const schema = Joi.object({
    eventName: Joi.string().required().min(3).max(100).label("eventName"),
    description: Joi.string().max(1000).allow('').label("description"),
    eventStart: Joi.date().required().label("eventStart"),
    eventEnd: Joi.date().min(Joi.ref('eventStart')).required().label("eventEnd"),
    eventType: Joi.string().required().label("eventType"),
    status: Joi.string().valid('planifie', 'confirme', 'annule', 'termine').required().label("status"),
    priorite: Joi.string().valid('basse', 'moyenne', 'haute', 'urgente').required().label("priorite"),
    lieu: Joi.string().required().label("lieu"),
    private: Joi.boolean().required().label("private"),
    participants: Joi.array().items(Joi.string()).label("participants"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des discussions
const addDiscution = (body) => {
  const schema = Joi.object({
    libelle: Joi.string().required().min(3).max(100).label("libelle"),
    description: Joi.string().max(1000).allow('').label("description"),
    idTache: Joi.string().required().label("idTache"),
    auteur: Joi.string().required().label("auteur"),
    participants: Joi.array().items(Joi.string()).label("participants"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation du répertoire
const addToRepertoireValidation = (body) => {
  const schema = Joi.object({
    nom: Joi.string().required().min(2).max(50).label("nom"),
    prenom: Joi.string().required().min(2).max(50).label("prenom"),
    email: Joi.string().required().email().label("email"),
    numero: Joi.string().required().pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).label("numero"),
    societe: Joi.string().required().min(2).max(100).label("societe"),
    fonction: Joi.string().required().min(2).max(100).label("fonction"),
    departement: Joi.string().max(100).allow('').label("departement"),
    adresse: Joi.string().max(200).allow('').label("adresse"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des sollicitations
const addSollicitation = (body) => {
  const schema = Joi.object({
    libelle: Joi.string().required().min(3).max(200).label("libelle"),
    description: Joi.string().max(1000).allow('').label("description"),
    idService: Joi.string().required().label("idService"),
    idResponsable: Joi.string().required().label("idResponsable"),
    priorite: Joi.string().valid('basse', 'moyenne', 'haute', 'urgente').required().label("priorite"),
    status: Joi.string().valid('en_attente', 'en_cours', 'termine', 'annule').required().label("status"),
    dateDebut: Joi.date().required().label("dateDebut"),
    dateFin: Joi.date().min(Joi.ref('dateDebut')).label("dateFin"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des demandes de participation
const addDemandePart = (body) => {
  const schema = Joi.object({
    idEvenements: Joi.string().required().label("idEvenements"),
    idResponsable: Joi.string().required().label("idResponsable"),
    status: Joi.string().valid('en_attente', 'accepte', 'refuse').default('en_attente').label("status"),
    message: Joi.string().max(500).allow('').label("message"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des fichiers de conférence
const addFilesConValidation = (body) => {
  const schema = Joi.object({
    libelle: Joi.string().required().min(3).max(100).label("libelle"),
    description: Joi.string().max(1000).allow('').label("description"),
    idEvenement: Joi.string().required().label("idEvenement"),
    date: Joi.date().required().label("date"),
    heureDebut: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
      .required()
      .label("heureDebut"),
    heureFin: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
      .required()
      .label("heureFin"),
    type: Joi.string().valid('presentation', 'document', 'video', 'autre').required().label("type"),
    taille: Joi.number().min(0).label("taille"),
    format: Joi.string().max(10).label("format"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des tâches événementielles par défaut
const addDefaultTacheEventValidation = (body) => {
  const schema = Joi.object({
    libelle: Joi.string().required().min(3).max(100).label("libelle"),
    description: Joi.string().max(1000).allow('').label("description"),
    enventType: Joi.string().required().label("enventType"),
    duree: Joi.number().min(0).label("duree"),
    priorite: Joi.string().valid('basse', 'moyenne', 'haute', 'urgente').default('moyenne').label("priorite"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des tâches événementielles
const addTacheEventValidation = (body) => {
  const schema = Joi.object({
    libelle: Joi.string().required().min(3).max(100).label("libelle"),
    description: Joi.string().max(1000).allow('').label("description"),
    evenement: Joi.string().required().label("evenement"),
    responsable: Joi.string().required().label("responsable"),
    dateDebut: Joi.date().required().label("dateDebut"),
    dateFin: Joi.date().min(Joi.ref('dateDebut')).required().label("dateFin"),
    status: Joi.string().valid('en_cours', 'en_attente', 'termine', 'annule').required().label("status"),
    priorite: Joi.string().valid('basse', 'moyenne', 'haute', 'urgente').required().label("priorite"),
    progression: Joi.number().min(0).max(100).default(0).label("progression"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des messages
const addMessage = (body) => {
  const schema = Joi.object({
    idTache: Joi.string().required().label("idTache"),
    idDiscussion: Joi.string().required().label("idDiscussion"),
    contenu: Joi.string().required().min(1).max(2000).label("contenu"),
    auteur: Joi.string().required().label("auteur"),
    type: Joi.string().valid('texte', 'fichier', 'image').default('texte').label("type"),
    fichier: Joi.string().allow('').label("fichier"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des responsables
const addResponsablesValidation = (body) => {
  const schema = Joi.object({
    nom: Joi.string().required().min(2).max(50).label("nom"),
    prenom: Joi.string().required().min(2).max(50).label("prenom"),
    poste: Joi.string().required().label("poste"),
    service: Joi.string().required().label("service"),
    position: Joi.string().required().label("position"),
    email: Joi.string().required().email().label("email"),
    telephone: Joi.string().pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).label("telephone"),
    competences: Joi.array().items(Joi.string()).label("competences"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des profils
const addProfilesValidation = (body) => {
  const schema = Joi.object({
    login: Joi.string().required().min(3).max(50).label("login"),
    email: Joi.string().required().email().label("email"),
    role: Joi.string().valid('admin', 'user', 'manager').required().label("role"),
    isActive: Joi.boolean().default(true).label("isActive"),
    isValidated: Joi.boolean().default(false).label("isValidated"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation du code de profil
const codeProfilesValidation = (body) => {
  const schema = Joi.object({
    code: Joi.string().required().length(6).pattern(/^[0-9]{6}$/).label("code de validation")
      .messages({
        'string.pattern.base': 'Le code de validation doit contenir exactement 6 chiffres'
      })
  }).messages(customMessages);
  return schema.validate(body);
};

// Validation des priorités
const addPrioritesValidation = (body) => {
  const schema = Joi.object({
    libelle: Joi.string().required().min(3).max(100).label("libelle"),
    description: Joi.string().max(1000).allow('').label("description"),
    objectifOperationnel: Joi.string().required().min(3).max(200).label("objectifOperationnel"),
    typePriorite: Joi.string().valid('strategique', 'operationnel', 'tactique').required().label("typePriorite"),
    code: Joi.string().required().min(2).max(10).label("code"),
    niveau: Joi.number().min(1).max(5).required().label("niveau"),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
  }).messages(customMessages);
  return schema.validate(body);
};

module.exports = {
  logInBodyValidation,
  addTachesValidation,
  addProjetValidation,
  addObservationValidation,
  updatePasswordValidation,
  addEvent,
  addResponsablesValidation,
  addProfilesValidation,
  codeProfilesValidation,
  addSousTacheValidation,
  addDiscution,
  addMessage,
  addDemandePart,
  addFilesConValidation,
  addDefaultTacheEventValidation,
  addTacheEventValidation,
  addSollicitation,
  addToRepertoireValidation,
  addPrioritesValidation
};
