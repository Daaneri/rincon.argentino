// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // <--- NUEVO: Instalalo con npm install axios
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// --- NUEVO ENDPOINT PARA ENVÍOS ---
app.post('/test-shipping', async (req, res) => {
  const { zipcode } = req.body;
  
  try {
    const response = await axios.post('https://api.envia.com/ship/rate', {
      origin: { "postalCode": "2919" }, // Tu CP: Villa Constitución
      destination: { "postalCode": zipcode },
      packages: [{ weight: 1, length: 10, width: 10, height: 10 }] // Peso/medidas estándar
    }, { 
      headers: { 'Authorization': `Bearer ${process.env.ENVIA_API_KEY}` } 
    });
    
    // Devolvemos el precio del servicio más barato que encuentre
    const rate = response.data.rate[0]; 
    res.json({ price: rate.totalPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo calcular el envío" });
  }
});

// --- RUTA PREFERENCIA MERCADO PAGO ---
app.post('/create_preference', async (req, res) => {
  try {
    const { items } = req.body;
    const preference = new Preference(client);
    
    const result = await preference.create({
      body: {
        items: items,
        back_urls: {
          success: "https://rincon-argentino.vercel.app/",
          failure: "https://rincon-argentino.vercel.app/",
        },
        auto_return: "approved",
      }
    });
    res.json({ id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));