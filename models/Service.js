const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  libelle: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema); 