const mongoose = require('mongoose');

const dbConfig = {
    // Options de connexion
    connectionOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        minPoolSize: 5,
        retryWrites: true,
        w: 'majority',
        // Options de performance
        autoIndex: process.env.NODE_ENV !== 'production',
        // Options de sécurité
        ssl: process.env.NODE_ENV === 'production',
        sslValidate: process.env.NODE_ENV === 'production',
        // Options de monitoring
        monitorCommands: process.env.NODE_ENV === 'development'
    },

    // Configuration des index
    indexes: {
        // Index pour les utilisateurs
        users: [
            { email: 1, unique: true },
            { role: 1 },
            { isActive: 1 },
            { createdAt: 1 }
        ],
        // Index pour les messages
        messages: [
            { sender: 1, receiver: 1 },
            { createdAt: -1 }
        ],
        // Index pour les projets
        projects: [
            { responsable: 1 },
            { status: 1 },
            { createdAt: -1 }
        ]
    },

    // Configuration des schémas
    schemaOptions: {
        timestamps: true,
        toJSON: { 
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                delete ret.password;
                return ret;
            }
        },
        toObject: { 
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                delete ret.password;
                return ret;
            }
        }
    },

    // Gestion des événements de connexion
    connectionEvents: {
        onConnected: () => {
            console.log('MongoDB connecté avec succès');
        },
        onError: (err) => {
            console.error('Erreur de connexion MongoDB:', err);
        },
        onDisconnected: () => {
            console.log('MongoDB déconnecté');
        }
    },

    // Gestion de la déconnexion propre
    gracefulShutdown: async () => {
        try {
            await mongoose.connection.close();
            console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
            process.exit(0);
        } catch (error) {
            console.error('Erreur lors de la fermeture de la connexion MongoDB:', error);
            process.exit(1);
        }
    }
};

module.exports = dbConfig; 