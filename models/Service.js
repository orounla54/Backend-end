const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  description: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema); 