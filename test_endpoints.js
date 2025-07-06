const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const endpoints = [
  '/services/forUpdate',
  '/services/public',
  '/users/actifs',
  '/typesTaches',
  '/filter/typesTaches',
  '/projets/public',
];

(async () => {
  for (const endpoint of endpoints) {
    try {
      const res = await axios.get(BASE_URL + endpoint);
      console.log(`✅ ${endpoint} →`, Array.isArray(res.data) ? `${res.data.length} éléments` : res.data);
    } catch (err) {
      if (err.response) {
        console.error(`❌ ${endpoint} →`, err.response.status, err.response.data);
      } else {
        console.error(`❌ ${endpoint} →`, err.message);
      }
    }
  }
})(); 