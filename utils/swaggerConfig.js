const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Documentations DigitalBrics',
      version: '1.0.0',
      description: "Documentations d'utilisations de l'api de DigitalBrics",
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Serveur de développement'
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')], // Chemin correct vers les fichiers de routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;
