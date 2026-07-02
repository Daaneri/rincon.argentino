const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.post('/test-shipping', (req, res) => {
    console.log("Datos recibidos:", req.body);
    res.status(200).json({ costo: "$5.500", mensaje: "Éxito" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));