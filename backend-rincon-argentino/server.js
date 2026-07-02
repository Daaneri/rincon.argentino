const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Permite peticiones desde cualquier origen
app.use(express.json());

// Ruta de prueba definitiva
app.post('/test-shipping', (req, res) => {
    console.log("¡Recibí la petición en el servidor!");
    res.status(200).json({ mensaje: "Conexión exitosa", data: req.body });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));