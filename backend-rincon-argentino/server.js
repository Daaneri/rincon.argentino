const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ESTA RUTA DEBE EXISTIR PARA QUE EL FETCH FUNCIONE
app.post('/test-shipping', (req, res) => {
    console.log("¡Recibí la petición en el servidor!");
    res.status(200).json({ mensaje: "Conexión exitosa" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));