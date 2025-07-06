const cors = require('cors');

const allowedOrigins = [
  'https://projet-de-fin-frontend.onrender.com', // Remplace par l'URL Render de ton frontend
  'http://localhost:5173', // Vite
  'http://localhost:3000'  // CRA
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
// ... le reste de la config Express ... 