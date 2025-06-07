const nodemailer = require("nodemailer");
require("dotenv").config();

// Configurer le transporteur Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.SERVICE, // Vous pouvez remplacer par un autre service SMTP
  auth: {
    user: process.env.USER_EMAIL, // Remplacez par votre e-mail
    pass: process.env.PASS_EMAIL,    // Remplacez par votre mot de passe ou mot de passe d'application
  },
});

// Fonction pour envoyer un e-mail
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.USER_EMAIL, // Expéditeur
      to,                           // Destinataire
      subject,                      // Sujet
      text,                         // Corps du message
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail envoyé : ", info.response);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail : ", error);
    throw error;
  }
};

module.exports = sendEmail;
