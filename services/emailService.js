const nodemailer = require('nodemailer');

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Fonction pour envoyer le code de validation
const sendValidationCode = async (email, code) => {
  try {
    const subject = 'Code de validation de votre compte';
    const template = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Validation de votre compte</h2>
        <p>Bonjour,</p>
        <p>Votre compte a été créé avec succès. Pour finaliser votre inscription, veuillez utiliser le code de validation suivant :</p>
        <div style="text-align: center; margin: 30px 0;">
          <h1 style="font-size: 32px; color: #4F46E5; letter-spacing: 5px; padding: 20px; background-color: #f3f4f6; border-radius: 5px; display: inline-block;">
            ${code}
          </h1>
        </div>
        <p>Ce code est valable pendant 15 minutes.</p>
        <p>Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
        <p>Cordialement,<br>L'équipe de support</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: template
    };

    await transporter.sendMail(mailOptions);
    console.log('Code de validation envoyé avec succès à:', email);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code de validation:', error);
    throw error;
  }
};

// Fonction pour envoyer un email
const sendPasswordResetEmail = async (email, token, type = 'reset') => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    let subject, link, template;

    if (type === 'reset') {
      subject = 'Réinitialisation de votre mot de passe';
      link = `${frontendUrl}/profiles/reinitialiser-mot-de-passe/${token}`;
      template = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
          <p style="text-align: center;">
            <a href="${link}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
          </p>
          <p>Ce lien est valable pendant 15 minutes.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe de support</p>
        </div>
      `;
    } else if (type === 'login') {
      subject = 'Connexion à votre compte';
      link = `${frontendUrl}/profiles/connexion/${token}`;
      template = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Connexion à votre compte</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé une connexion à votre compte. Veuillez cliquer sur le lien ci-dessous pour vous connecter :</p>
          <p style="text-align: center;">
            <a href="${link}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Se connecter</a>
          </p>
          <p>Ce lien est valable pendant 15 minutes.</p>
          <p>Si vous n'avez pas demandé cette connexion, veuillez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe de support</p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: template
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de ${type} envoyé avec succès à:`, email);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendValidationCode
};