const mongoose = require('mongoose');

const typeTacheSchema = new mongoose.Schema({
  libelle: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TypeTache', typeTacheSchema); 