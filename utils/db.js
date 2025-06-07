const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: 10,
            minPoolSize: 5,
            retryWrites: true,
            w: 'majority'
        });

        // Gestion des événements de connexion
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connecté avec succès');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Erreur de connexion MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB déconnecté');
        });

        // Gestion de la déconnexion propre
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
            process.exit(0);
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erreur de connexion MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 