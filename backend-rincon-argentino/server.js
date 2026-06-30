// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

// Configuramos Mercado Pago con el token que te va a dar Gastón
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

app.post('/create_preference', async (req, res) => {
  try {
    const { items } = req.body; // Recibimos el carrito desde tu frontend
    const preference = new Preference(client);
    
    const result = await preference.create({
      body: {
        items: items, // [{title: 'Producto', unit_price: 1000, quantity: 1}]
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