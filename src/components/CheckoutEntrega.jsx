import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const PESO_ESTIMADO_POR_UNIDAD = 0.5;

const PROVINCIAS = [
  { code: "BA", name: "Buenos Aires" }, { code: "CA", name: "Catamarca" },
  { code: "CH", name: "Chaco" }, { code: "CU", name: "Chubut" },
  { code: "DF", name: "CABA" }, { code: "CB", name: "Córdoba" },
  { code: "CR", name: "Corrientes" }, { code: "ER", name: "Entre Ríos" },
  { code: "FO", name: "Formosa" }, { code: "JY", name: "Jujuy" },
  { code: "LP", name: "La Pampa" }, { code: "LR", name: "La Rioja" },
  { code: "MZ", name: "Mendoza" }, { code: "MN", name: "Misiones" },
  { code: "NQ", name: "Neuquén" }, { code: "RN", name: "Río Negro" },
  { code: "SA", name: "Salta" }, { code: "SJ", name: "San Juan" },
  { code: "SL", name: "San Luis" }, { code: "SC", name: "Santa Cruz" },
  { code: "SF", name: "Santa Fe" }, { code: "SE", name: "Santiago del Estero" },
  { code: "TF", name: "Tierra del Fuego" }, { code: "TU", name: "Tucumán" },
];

export default function CheckoutEntrega() {
  const { cart } = useCart();
  const navigate = useNavigate();

  const [shippingData, setShippingData] = useState({
    name: "", phone: "", street: "", city: "", state: "", postalCode: "",
  });

  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  const totalProductos = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalConEnvio = totalProductos + (selectedRate?.totalPrice ?? 0);

  async function buscarPorCP(cp) {
    if (cp.length !== 4) return;
    try {
      const res = await fetch(`https://rincon-argentino.onrender.com/api/shipping/geocode/${cp}`);
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
    const estimatedWeight = totalQuantity * PESO_ESTIMADO_POR_UNIDAD;

    const packages = [{
      type: "box",
      content: "Productos Rincón Argentino",
      amount: 1,
      declaredValue: totalProductos,
      lengthUnit: "CM",
      weightUnit: "KG",
      weight: estimatedWeight,
      dimensions: { length: 20, width: 20, height: 20 },
    }];

    try {
      const res = await fetch("https://rincon-argentino.onrender.com/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: { ...shippingData, country: "AR" }, packages }),
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

  const inputClass =
    "w-full bg-transparent border border-[#E6DCC8]/20 rounded-xl px-4 py-3 text-[#E6DCC8] placeholder:text-[#E6DCC8]/40 focus:outline-none focus:border-[#E6DCC8]/60 transition-colors";

  return (
    <div className="w-full max-w-6xl mx-auto py-16 px-6">
      {/* Indicador de pasos */}
      <div className="flex items-center justify-center gap-4 mb-16 text-sm text-[#E6DCC8]/50">
        <span className="text-[#E6DCC8]">Carrito</span>
        <div className="h-px w-12 bg-[#E6DCC8]/20" />
        <span className="text-[#E6DCC8] font-semibold">Entrega</span>
        <div className="h-px w-12 bg-[#E6DCC8]/20" />
        <span>Pago</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

        {/* Columna izquierda: formulario ancho */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-[#2D3025]/40 rounded-3xl border border-[#E6DCC8]/10 p-8">
            <h2 className="text-2xl font-serif text-[#E6DCC8] mb-6">Datos de contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="bg-[#2D3025]/40 rounded-3xl border border-[#E6DCC8]/10 p-8 space-y-4">
            <h2 className="text-2xl font-serif text-[#E6DCC8] mb-2">Entrega</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                className={inputClass}
                placeholder="Código postal"
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
                <option value="" className="text-black">Provincia</option>
                {PROVINCIAS.map((p) => (
                  <option key={p.code} value={p.code} className="text-black">{p.name}</option>
                ))}
              </select>
            </div>

            <input
              className={inputClass}
              placeholder="Calle y número"
              value={shippingData.street}
              onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
            />

            <button
              onClick={cotizarEnvio}
              disabled={loadingQuote}
              className="w-full sm:w-auto bg-[#E6DCC8] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-[#2D3025] font-semibold tracking-wide rounded-xl px-8 py-3 transition-colors"
            >
              {loadingQuote ? "Cotizando..." : "Calcular envío"}
            </button>

            {quoteError && (
              <p className="text-sm text-[#e08a6b] border border-[#e08a6b]/30 bg-[#e08a6b]/10 rounded-xl px-4 py-3">
                {quoteError}
              </p>
            )}

            {rates.length > 0 && (
              <div className="pt-2">
                <label className="block text-sm text-[#E6DCC8]/70 mb-2">Elegí una opción de envío</label>
                <select
                  className={inputClass}
                  value={selectedRate ? rates.indexOf(selectedRate) : ""}
                  onChange={(e) => setSelectedRate(rates[e.target.value])}
                >
                  <option value="" className="text-black">Seleccioná una opción</option>
                  {rates.map((rate, i) => (
                    <option key={i} value={i} className="text-black">
                      {rate.carrierDescription} - {rate.serviceDescription} - ${rate.totalPrice.toLocaleString("es-AR")} ({rate.deliveryEstimate})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: resumen sticky */}
        <div className="lg:col-span-5 bg-[#1A1C16] p-10 rounded-3xl border border-[#E6DCC8]/10 sticky top-28 shadow-2xl space-y-4">
          <h2 className="text-3xl font-serif text-[#E6DCC8] mb-6">Sumario de compra</h2>

          <div className="flex justify-between text-sm text-[#E6DCC8]/70">
            <span>Subtotal</span>
            <span>${totalProductos.toLocaleString("es-AR")}</span>
          </div>
          <div className="flex justify-between text-sm text-[#E6DCC8]/70">
            <span>Envío</span>
            <span>{selectedRate ? `$${selectedRate.totalPrice.toLocaleString("es-AR")}` : "A calcular"}</span>
          </div>
          <div className="flex justify-between items-center text-2xl font-bold text-[#E6DCC8] border-t border-[#E6DCC8]/10 pt-6">
            <span>Total</span>
            <span className="text-4xl tracking-tight">${totalConEnvio.toLocaleString("es-AR")}</span>
          </div>

          <button
            onClick={irAPagar}
            disabled={!selectedRate}
            className="w-full bg-[#E6DCC8] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-[#2D3025] font-semibold tracking-wide rounded-xl px-6 py-4 transition-colors text-lg mt-2"
          >
            Continuar para el pago
          </button>
        </div>
      </div>
    </div>
  );
}