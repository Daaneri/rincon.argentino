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

  async function buscarPorCP(cp) {
    if (cp.length !== 4) return;

    try {
      const res = await fetch(`http://localhost:4000/api/shipping/geocode/${cp}`);
      if (!res.ok) return;

      const data = await res.json();
      const result = Array.isArray(data) ? data[0] : data;

      if (result) {
        setShippingData((prev) => ({
          ...prev,
          city: result.locality || prev.city,
          state: result.state?.code?.["2digit"] || prev.state,
        }));
      }
    } catch (err) {
      console.error("Error buscando CP:", err);
    }
  }

  async function cotizarEnvio() {
    setLoadingQuote(true);
    setQuoteError(null);
    setSelectedRate(null);

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
      const res = await fetch("http://localhost:4000/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: { ...shippingData, country: "AR" },
          packages,
        }),
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

  function irAPagar() {
    // TODO: conectar MercadoPago acá — próximo paso
    console.log("Pagar con:", selectedRate);
  }

  const totalProductos = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalConEnvio = totalProductos + (selectedRate?.totalPrice ?? 0);

  const inputClass =
    "flex-1 min-w-[100px] bg-transparent border border-[#5a5f47] rounded-md px-2.5 py-1.5 text-[#f0e6d2] placeholder:text-[#a8a88f] focus:outline-none focus:border-[#c9a227] transition-colors text-sm";

  return (
    <div className="space-y-2.5">
      <h3 className="font-serif text-base text-[#f0e6d2] tracking-wide mb-1">Datos de envío</h3>

      <div className="flex flex-wrap gap-2">
        <input
          className={inputClass}
          placeholder="Nombre completo"
          value={shippingData.name}
          onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Teléfono"
          value={shippingData.phone}
          onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
        />
      </div>

      <input
        className={`${inputClass} w-full`}
        placeholder="Calle y número"
        value={shippingData.street}
        onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
      />

      <div className="flex flex-wrap gap-2">
        <input
          className={inputClass}
          placeholder="C.P."
          value={shippingData.postalCode}
          onChange={(e) => {
            const cp = e.target.value;
            setShippingData({ ...shippingData, postalCode: cp });
            buscarPorCP(cp);
          }}
        />
        <input
          className={inputClass}
          placeholder="Ciudad"
          value={shippingData.city}
          onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
        />
        <select
          className={inputClass}
          value={shippingData.state}
          onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
        >
          <option value="">Provincia</option>
          <option value="BA">Buenos Aires</option>
          <option value="CA">Catamarca</option>
          <option value="CH">Chaco</option>
          <option value="CU">Chubut</option>
          <option value="DF">CABA</option>
          <option value="CB">Córdoba</option>
          <option value="CR">Corrientes</option>
          <option value="ER">Entre Ríos</option>
          <option value="FO">Formosa</option>
          <option value="JY">Jujuy</option>
          <option value="LP">La Pampa</option>
          <option value="LR">La Rioja</option>
          <option value="MZ">Mendoza</option>
          <option value="MN">Misiones</option>
          <option value="NQ">Neuquén</option>
          <option value="RN">Río Negro</option>
          <option value="SA">Salta</option>
          <option value="SJ">San Juan</option>
          <option value="SL">San Luis</option>
          <option value="SC">Santa Cruz</option>
          <option value="SF">Santa Fe</option>
          <option value="SE">Santiago del Estero</option>
          <option value="TF">Tierra del Fuego</option>
          <option value="TU">Tucumán</option>
        </select>
      </div>

      <button
        onClick={cotizarEnvio}
        disabled={loadingQuote}
        className="w-full bg-[#c9a227] hover:bg-[#d9b53a] disabled:opacity-50 disabled:cursor-not-allowed text-[#1a1e13] font-medium tracking-wide rounded-md px-6 py-2 transition-colors text-sm mt-1"
      >
        {loadingQuote ? "Cotizando..." : "Calcular envío"}
      </button>

      {quoteError && (
        <p className="text-xs text-[#e08a6b] border border-[#e08a6b]/30 bg-[#e08a6b]/10 rounded-md px-3 py-2">
          {quoteError}
        </p>
      )}

      {rates.length > 0 && (
        <div className="space-y-1.5 border-t border-[#3d4230] pt-3">
          <h3 className="font-serif text-sm text-[#f0e6d2] mb-1.5">Elegí una opción de envío</h3>
          {rates.map((rate, i) => (
            <label
              key={i}
              className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 cursor-pointer transition-colors text-xs ${
                selectedRate === rate
                  ? "border-[#c9a227] bg-[#c9a227]/10"
                  : "border-[#3d4230] hover:border-[#5a5f47]"
              }`}
            >
              <input
                type="radio"
                name="shippingOption"
                checked={selectedRate === rate}
                onChange={() => setSelectedRate(rate)}
                className="accent-[#c9a227]"
              />
              <span className="text-[#f0e6d2] font-medium">{rate.carrierDescription}</span>
              <span className="text-[#a8a88f]">
                {rate.serviceDescription} · {rate.deliveryEstimate}
              </span>
              <span className="text-[#c9a227] font-medium ml-auto whitespace-nowrap">
                ${rate.totalPrice.toLocaleString("es-AR")}
              </span>
            </label>
          ))}
        </div>
      )}

      {selectedRate && (
        <div className="border-t border-[#3d4230] pt-3 space-y-1">
          <div className="flex justify-between text-xs text-[#a8a88f]">
            <span>Productos</span>
            <span>${totalProductos.toLocaleString("es-AR")}</span>
          </div>
          <div className="flex justify-between text-xs text-[#a8a88f]">
            <span>Envío</span>
            <span>${selectedRate.totalPrice.toLocaleString("es-AR")}</span>
          </div>
          <div className="flex justify-between text-[#f0e6d2] font-serif text-base pt-1.5 border-t border-[#3d4230]">
            <span>Total</span>
            <span>${totalConEnvio.toLocaleString("es-AR")}</span>
          </div>

          <button
            onClick={irAPagar}
            className="w-full bg-[#f0e6d2] hover:bg-white text-[#1a1e13] font-medium tracking-wide rounded-md px-6 py-2.5 transition-colors mt-2 text-sm"
          >
            Continuar al pago
          </button>
        </div>
      )}
    </div>
  );
}