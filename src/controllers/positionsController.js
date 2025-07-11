exports.getPositions = (req, res) => {
  res.json([
    { id: 1, nom: 'Développeur' },
    { id: 2, nom: 'Chef de projet' },
    { id: 3, nom: 'Testeur' },
    { id: 4, nom: 'Designer' }
  ]);
}; 