// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/shipping/quote", async (req, res) => {
  const { destination, packages } = req.body;

  if (!destination || !packages) {
    return res.status(400).json({ error: "Faltan destination o packages" });
  }

  const origin = {
    name: process.env.ORIGIN_NAME,
    phone: process.env.ORIGIN_PHONE,
    street: process.env.ORIGIN_STREET,
    city: process.env.ORIGIN_CITY,
    state: process.env.ORIGIN_STATE,
    country: "AR",
    postalCode: process.env.ORIGIN_POSTALCODE,
  };

  const carriers = ["andreani", "oca"];

  try {
    const results = await Promise.all(
      carriers.map(async (carrier) => {
        const r = await fetch(`${process.env.ENVIA_API_BASE}/ship/rate/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.ENVIA_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin,
            destination,
            packages,
            shipment: { type: 1, carrier },
          }),
        });

        const raw = await r.text();
        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          console.error(`Respuesta no-JSON de Envia (carrier ${carrier}), status ${r.status}:`, raw);
          return [];
        }

        console.log(`--- Respuesta Envia ${carrier} (status ${r.status}) ---`, JSON.stringify(data));
        if (!r.ok) {
          return [];
        }
        return data?.data ?? [];

      })
    );

    res.json({ rates: results.flat() });
  } catch (err) {
    console.error("Envia quote error:", err);
    res.status(500).json({ error: "No se pudo cotizar el envío" });
  }
});

app.get("/api/shipping/geocode/:postalCode", async (req, res) => {
  const { postalCode } = req.params;

  try {
    const r = await fetch(`https://geocodes.envia.com/zipcode/AR/${postalCode}`, {
      headers: {
        Authorization: `Bearer ${process.env.ENVIA_API_TOKEN}`,
      },
    });

    const raw = await r.text();
    console.log(`--- Respuesta Geocode ${postalCode} (status ${r.status}) ---`, raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: "Respuesta inválida del servicio de geocodificación" });
    }

    if (!r.ok) {
      return res.status(404).json({ error: "Código postal no encontrado" });
    }

    res.json(data);
  } catch (err) {
    console.error("Geocode error:", err);
    res.status(500).json({ error: "No se pudo consultar el código postal" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server corriendo en puerto ${PORT}`));