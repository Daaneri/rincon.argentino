const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Ruta específica para Envíos
app.post('/shipping-quote', (req, res) => {
    const { zipcode } = req.body;
    console.log("Calculando envío para:", zipcode);
    
    // Aquí iría tu integración real con la API de envíos
    res.status(200).json({ 
        success: true, 
        cost: 4500, 
        service: "Envíos.com" 
    });
});

app.listen(3000, () => console.log('Servidor activo'));