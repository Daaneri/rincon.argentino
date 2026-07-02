import { useState } from "react";
import { useCart } from "../context/CartContext";

const PESO_ESTIMADO_POR_UNIDAD = 0.5;

export default function OrderForm() {
  const { cart } = useCart();

  const [shippingData, setShippingData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  async function cotizarEnvio() {
    setLoadingQuote(true);
    setQuoteError(null);

    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const estimatedWeight = totalQuantity * PESO_ESTIMADO_POR_UNIDAD;

    const packages = [
      {
        type: "box",
        content: "Productos Rincón Argentino",
        amount: 1,
        declaredValue: totalValue,
        lengthUnit: "CM",
        weightUnit: "KG",
        weight: estimatedWeight,
        dimensions: { length: 20, width: 20, height: 20 },
      },
    ];

    try {
      const res = await fetch("https://rincon-argentino.onrender.com/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: shippingData, packages }),
      });
      const data = await res.json();

      if (!res.ok || !data.rates || data.rates.length === 0) {
        setQuoteError("No se encontraron opciones de envío para esa dirección.");
        setRates([]);
        return;
      }

      setRates(data.rates);
    } catch (err) {
      console.error("Error cotizando envío:", err);
      setQuoteError("Error al conectar con el servidor de envíos.");
    } finally {
      setLoadingQuote(false);
    }
  }

  return (
    <div>
      <h2>Datos de envío</h2>

      <input
        placeholder="Nombre completo"
        value={shippingData.name}
        onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })}
      />
      <input
        placeholder="Teléfono"
        value={shippingData.phone}
        onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
      />
      <input
        placeholder="Calle y número"
        value={shippingData.street}
        onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
      />
      <input
        placeholder="Ciudad"
        value={shippingData.city}
        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
      />
      <input
        placeholder="Provincia (código, ej: SF)"
        value={shippingData.state}
        onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
      />
      <input
        placeholder="Código postal"
        value={shippingData.postalCode}
        onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
      />

      <button onClick={cotizarEnvio} disabled={loadingQuote}>
        {loadingQuote ? "Cotizando..." : "Calcular envío"}
      </button>

      {quoteError && <p style={{ color: "red" }}>{quoteError}</p>}

      {rates.length > 0 && (
        <div>
          <h3>Elegí una opción de envío</h3>
          {rates.map((rate, i) => (
            <label key={i} style={{ display: "block", marginBottom: 8 }}>
              <input
                type="radio"
                name="shippingOption"
                checked={selectedRate === rate}
                onChange={() => setSelectedRate(rate)}
              />
              {rate.carrierDescription} - {rate.serviceDescription} - ${rate.totalPrice} {rate.currency} ({rate.deliveryEstimate})
            </label>
          ))}
        </div>
      )}
    </div>
  );
}