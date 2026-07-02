const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ESTA ES LA RUTA QUE TE DA EL ERROR 404
app.post('/create_preference', (req, res) => {
    console.log("¡Recibí la orden!");
    res.status(200).json({ mensaje: "Todo funciona bien" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));