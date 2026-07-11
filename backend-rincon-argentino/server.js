// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Clientes ---
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// --- ENVIO: Cotización (Andreani vía Envia.com) ---
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

  const carriers = ["andreani"];

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

        if (!r.ok || data.meta === "error") {
          console.error(`Error carrier ${carrier}:`, data.error || data);
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

// --- ENVIO: Geocode por código postal ---
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

// --- Email de notificación de nuevo pedido (via Resend, HTTPS - sin problemas de SMTP en Render) ---
async function enviarEmailNotificacion(orderData) {
  const { error } = await resend.emails.send({
    from: "Rincón Argentino <onboarding@resend.dev>",
    to: process.env.EMAIL_ADMIN,
    subject: `Nuevo Pedido #${orderData.identificador}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #c9a227;">¡Nuevo pedido recibido!</h2>
        <p>Se ha registrado un nuevo pedido en tu página.</p>

        <h3>Datos del comprador:</h3>
        <ul>
          <li><b>Nombre:</b> ${orderData.nombre_del_cliente}</li>
          <li><b>DNI:</b> ${orderData.dni || "-"}</li>
          <li><b>Teléfono:</b> ${orderData.telefono}</li>
          <li><b>Correo:</b> ${orderData.email || "-"}</li>
          <li><b>Dirección:</b> ${orderData.direccion}, ${orderData.ciudad} (${orderData.provincia})</li>
          <li><b>C.P.:</b> ${orderData.codigo_postal}</li>
        </ul>

        <h3>Detalle de productos:</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="border: 1px solid #ddd; padding: 8px;">Producto</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Cantidad</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${orderData.productos.map(p => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${p.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${p.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">$${Number(p.price).toLocaleString('es-AR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <p><b>Costo de envío:</b> $${Number(orderData.costo_de_envio).toLocaleString('es-AR')}</p>
        <h3 style="color: #c9a227;">Total: $${Number(orderData.total).toLocaleString('es-AR')}</h3>
      </div>
    `,
  });

  if (error) {
    throw new Error(JSON.stringify(error));
  }
}

// --- PAGO: crear pedido en Supabase + preferencia de MercadoPago ---
app.post("/api/payment/create-preference", async (req, res) => {
  const { items, shippingCost, shippingDescription, customer } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Faltan items del carrito" });
  }

  if (!customer || !customer.name || !customer.dni || !customer.phone || !customer.email || !customer.address) {
    return res.status(400).json({ error: "Faltan datos del cliente" });
  }

  try {
    const totalProductos = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = totalProductos + Number(shippingCost || 0);

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        nombre_del_cliente: customer.name,
        dni: customer.dni,
        telefono: customer.phone,
        email: customer.email,
        direccion: customer.address,
        ciudad: customer.city,
        provincia: customer.state,
        codigo_postal: customer.postalCode,
        productos: items,
        costo_de_envio: Number(shippingCost || 0),
        total: total,
        estado: "pendiente",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error guardando pedido en Supabase:", orderError);
      return res.status(500).json({ error: "No se pudo registrar el pedido" });
    }

    console.log("Pedido guardado:", orderData.identificador);

    // Enviar mail de notificación en segundo plano, sin bloquear el pago
    enviarEmailNotificacion(orderData).catch((mailErr) => {
      console.error("Error enviando email de notificación:", mailErr);
    });

    const preferenceItems = items.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: Number(item.price),
      currency_id: "ARS",
    }));

    if (shippingCost > 0) {
      preferenceItems.push({
        title: shippingDescription || "Costo de envío",
        quantity: 1,
        unit_price: Number(shippingCost),
        currency_id: "ARS",
      });
    }

    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: preferenceItems,
        payer: {
          name: customer.name,
          email: customer.email,
        },
        external_reference: orderData.identificador.toString(),
        back_urls: {
          success: "https://rinconargentinoo.com.ar/checkout/exito",
          failure: "https://rinconargentinoo.com.ar/checkout/error",
          pending: "https://rinconargentinoo.com.ar/checkout/pendiente",
        },
        auto_return: "approved",
      },
    });

    res.json({ init_point: result.init_point });
  } catch (err) {
    console.error("Error creando preferencia MP:", err);
    res.status(500).json({ error: "No se pudo iniciar el pago" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server corriendo en puerto ${PORT}`));