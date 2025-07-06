const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connecté: ${conn.connection.host}`.cyan.underline.bold);
  } catch (error) {
    console.error(`Erreur: ${error.message}`.red.underline.bold);
    process.exit(1);
  }
};

module.exports = connectDB; 