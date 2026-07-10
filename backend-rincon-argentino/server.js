import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Configuración de clientes
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// 2. Configuración Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- NUEVAS RUTAS DE ENVÍO AGREGADAS ---
app.get("/api/shipping/geocode/:cp", async (req, res) => {
  // Implementa aquí la lógica de tu proveedor de envíos
  res.json({ locality: "Villa Constitución", state: { code: { "2digit": "SF" } } });
});

app.post("/api/shipping/quote", async (req, res) => {
  // Implementa aquí la lógica real de cotización de tu servicio de logística
  res.json({
    rates: [{
      carrierDescription: "Correo Argentino",
      serviceDescription: "Envío Estándar",
      deliveryEstimate: "3-5 días",
      totalPrice: 5500
    }]
  });
});
// ----------------------------------------

// Función para formatear y enviar el mail
const enviarEmailNotificacion = async (orderData) => {
  const mailOptions = {
    from: `"Rincón Argentino" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_ADMIN,
    subject: `Nuevo Pedido #${orderData.identificador}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #c9a227;">¡Nuevo pedido recibido!</h2>
        <p>Se ha registrado un nuevo pedido en tu página.</p>
        
        <h3>Datos del comprador:</h3>
        <ul>
          <li><b>Nombre:</b> ${orderData.nombre_del_cliente}</li>
          <li><b>Teléfono:</b> ${orderData.telefono}</li>
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
    `
  };

  await transporter.sendMail(mailOptions);
};

// 3. Ruta de Creación de Preferencia
app.post("/api/payment/create-preference", async (req, res) => {
  const { items, shippingCost, shippingDescription, customer } = req.body;

  try {
    const totalProductos = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = totalProductos + Number(shippingCost || 0);

    // A. Guardar en Supabase
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        nombre_del_cliente: customer.name,
        telefono: customer.phone,
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

    if (orderError) throw new Error("Error en DB: " + orderError.message);

    // B. Enviar Email de notificación
    await enviarEmailNotificacion(orderData);

    // C. Crear preferencia MP
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
    console.error("Error en flujo de pago:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server corriendo en puerto ${PORT}`));