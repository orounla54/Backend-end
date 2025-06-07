const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const TypeProjetController = require('./controllers/typesProjetCon');

// Import des routeurs
const authRouter = require("./routes/authRou");
const tachesRouter = require("./routes/tachesRou");
const evenementsRouter = require("./routes/evenementsRou");
const projetsRouter = require("./routes/projetsRou");
const servicesRouter = require("./routes/servicesRou");
const postesRouter = require("./routes/postesRou");
const discussionsRouter = require("./routes/discussionsRou");
const categoriesEvenementsRouter = require("./routes/categoriesEvenementsRou");
const typesProjetRouter = require("./routes/typesProjetRou");

const app = express();

// Middleware de base
app.use(cors({
  origin: process.env.VITE_BASE_URL_FRONTEND || "http://localhost:5173",
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Création du serveur HTTP
const httpServer = createServer(app);

// Configuration de Socket.IO avec le serveur HTTP
const io = new Server(httpServer, {
  path: '/socket.io/',
  cors: {
    origin: process.env.VITE_BASE_URL_FRONTEND || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  allowEIO3: true
});

// Attacher Socket.IO à l'application Express
app.set('io', io);

// Middleware pour ignorer les requêtes Socket.IO
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io/')) {
    return next();
  }
  // Continuer avec les autres middlewares
  next();
});

// Gestion des connexions Socket.IO
io.on("connection", (socket) => {
  console.log("Client connecté:", socket.id);

  // Gestion des erreurs de connexion
  socket.on("error", (error) => {
    console.error("Erreur Socket.IO:", error);
    socket.disconnect(true);
  });

  // Gestion de la déconnexion
  socket.on("disconnect", (reason) => {
    console.log("Client déconnecté:", socket.id, "Raison:", reason);
  });

  // Gestion des erreurs de transport
  socket.conn.on("error", (error) => {
    console.error("Erreur de transport Socket.IO:", error);
    socket.disconnect(true);
  });
});

// Connexion à la base de données
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/e2c-tic')
    .then(async () => {
        console.log('Connecté à MongoDB');
        await TypeProjetController.initialiserTypes();
    })
    .catch(err => {
        console.error('Erreur de connexion à MongoDB:', err);
        process.exit(1);
    });

// Montage des routeurs sous /api
app.use("/api/auth", authRouter);
app.use("/api/taches", tachesRouter);
app.use("/api/evenements", evenementsRouter);
app.use("/api/projets", projetsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/postes", postesRouter);
app.use("/api/discussions", discussionsRouter);
app.use("/api/categories-evenements", categoriesEvenementsRouter);
app.use("/api/types-projet", typesProjetRouter);

// Route par défaut
app.get("/api", (req, res) => {
  res.json({ message: "API E2C-TIC" });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Une erreur est survenue",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Middleware pour les routes non trouvées (doit être après tous les autres middlewares)
app.use((req, res) => {
  // Ignorer complètement les requêtes Socket.IO
  if (req.path.startsWith('/socket.io/')) {
    return;
  }
  
  // Logger uniquement les requêtes non-Socket.IO
  console.log("Route non trouvée:", req.method, req.path);
  res.status(404).json({ 
    status: "error",
    message: "Route non trouvée",
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Socket.IO est prêt sur ws://localhost:${PORT}`);
});

module.exports = { app, io }; 