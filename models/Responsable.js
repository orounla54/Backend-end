const mongoose = require("mongoose");

const responsableSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true
    },
    prenom: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    telephone: {
      type: String,
    },
    poste: {
      type: String,
      required: true,
      trim: true
    },
    departement: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    bio: {
      type: String,
    },
    competences: [String],
    experience: [String],
    formation: [String],
    idService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    idPoste: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poste',
      required: true
    },
    idPosition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
      required: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Responsable", responsableSchema); 