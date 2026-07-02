const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/create_preference', (req, res) => {
    console.log("¡Ruta /create_preference encontrada!");
    res.status(200).json({ id: "test-id-123" });
});

app.post('/test-shipping', (req, res) => {
    console.log("¡Ruta /test-shipping encontrada!");
    res.status(200).json({ mensaje: "Conexión exitosa" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));