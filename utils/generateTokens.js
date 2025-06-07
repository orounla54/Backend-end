const jwt = require("jsonwebtoken");
const sql = require('mssql')
require("dotenv").config();

const generateTokens = async (profile) => {
    try {
        // Crée le payload avec les informations de l'utilisateur
        const payload = { id: profile.id, role: profile.role };

        // Génère le token d'accès avec une expiration de 14 minutes
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_PRIVATE_KEY,
            { expiresIn: "1d" }
        );

        return { accessToken };

    } catch (err) {
        // Gère les erreurs en rejetant la promesse avec l'erreur
        console.log(err)
        
    }
};

module.exports = generateTokens;
