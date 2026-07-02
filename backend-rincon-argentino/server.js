const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Esta es la ruta para cotizar el envío
app.post('/test-shipping', (req, res) => {
    const { zipcode } = req.body;
    console.log("Cotizando envío para el código postal:", zipcode);
    
    // Aquí responderemos con la lógica de Envíos.com
    res.status(200).json({ 
        mensaje: "Cotización recibida",
        costo: "Calculando...",
        cp: zipcode 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));