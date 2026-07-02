require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();

// Configuración CORS estricta
app.use(cors({
  origin: 'https://rincon-argentino.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Responder a peticiones preflight (OPTIONS)
app.options('*', cors());

app.use(express.json());

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// --- ENDPOINT PARA ENVÍOS ---
app.post('/test-shipping', async (req, res) => {
  const { zipcode } = req.body;
  try {
    const response = await axios.post('https://api.envia.com/ship/rate', {
      origin: { "postalCode": "2919" }, 
      destination: { "postalCode": zipcode },
      packages: [{ weight: 1, length: 10, width: 10, height: 10 }]
    }, { 
      headers: { 'Authorization': `Bearer ${process.env.ENVIA_API_KEY}` } 
    });
    
    if (response.data && response.data.rate && response.data.rate.length > 0) {
      res.json({ price: response.data.rate[0].totalPrice });
    } else {
      res.status(404).json({ error: "No se encontraron tarifas" });
    }
  } catch (error) {
    console.error("Error Envia.com:", error.response?.data || error.message);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));