const User = require('../models/User');

exports.getResponsables = async (req, res) => {
  try {
    const responsables = await User.find({ role: 'responsable' });
    res.json(responsables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 